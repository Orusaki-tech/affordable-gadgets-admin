import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { NotificationsService, Notification } from '../api/index';

export const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', page, pageSize],
    queryFn: async () => {
      const response = await NotificationsService.notificationsList(page);
      return response;
    },
  });

  // Fetch unread count
  // Note: Backend returns {unread_count: number} but type says Notification, so we cast
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await NotificationsService.notificationsUnreadCountRetrieve();
      return response as any; // Backend returns {unread_count: number} not Notification
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => {
      // Get the notification first to build the request
      return NotificationsService.notificationsRetrieve(id).then(notification => {
        return NotificationsService.notificationsMarkReadCreate(id, {
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const unread = notificationsData?.results?.filter((n: Notification) => !n.is_read) || [];
      await Promise.all(
        unread
          .filter((n: Notification) => n.id)
          .map((n: Notification) =>
            fetch(`${baseUrl}/notifications/${n.id}/mark_read/`, {
              method: 'POST',
              headers: { 'Authorization': `Token ${token}` },
            })
          )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const getNotificationRoute = (notification: Notification): string | null => {
    if (!notification) return null;
    const contentTypeModel = (notification as any).content_type_model as string | undefined;

    if (notification.object_id) {
      switch (contentTypeModel) {
        case 'inventory.reservationrequest':
          return `/reservation-requests?requestId=${notification.object_id}`;
        case 'inventory.returnrequest':
          return `/return-requests?requestId=${notification.object_id}`;
        case 'inventory.unittransfer':
          return `/unit-transfers?transferId=${notification.object_id}`;
        case 'inventory.lead':
          return `/leads?leadId=${notification.object_id}`;
        default:
          break;
      }
    }

    switch (notification.notification_type) {
      case 'RA':
      case 'RR':
      case 'RE':
      case 'RP':
        return notification.object_id ? `/reservation-requests?requestId=${notification.object_id}` : '/reservation-requests';
      case 'TA':
      case 'TR':
        return notification.object_id ? `/return-requests?requestId=${notification.object_id}` : '/return-requests';
      case 'FA':
      case 'FR':
      case 'UR':
        return notification.object_id ? `/unit-transfers?transferId=${notification.object_id}` : '/unit-transfers';
      case 'NL':
        return notification.object_id ? `/leads?leadId=${notification.object_id}` : '/leads';
      case 'OC':
        return '/orders';
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const route = getNotificationRoute(notification);
    if (!route) return;
    if (notification.id && !notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    navigate(route);
  };

  // Client-side filtering
  const filteredNotifications = useMemo(() => {
    if (!notificationsData?.results) return [];
    let filtered = notificationsData.results;
    
    // Status filter
    if (filter === 'unread') {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter((n) => n.is_read);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((notification) => {
        const titleMatch = notification.title?.toLowerCase().includes(searchLower);
        const messageMatch = notification.message?.toLowerCase().includes(searchLower);
        const typeMatch = notification.notification_type?.toLowerCase().includes(searchLower);
        const typeDisplayMatch = notification.notification_type_display?.toLowerCase().includes(searchLower);
        return titleMatch || messageMatch || typeMatch || typeDisplayMatch;
      });
    }
    
    return filtered;
  }, [notificationsData, filter, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!notificationsData?.results) {
      return { total: 0, unread: 0, read: 0 };
    }
    const results = notificationsData.results;
    return {
      total: results.length,
      unread: results.filter((n) => !n.is_read).length,
      read: results.filter((n) => n.is_read).length,
    };
  }, [notificationsData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'RA': return '✅';
      case 'RR': return '❌';
      case 'RE': return '⏰';
      case 'TA': return '✅';
      case 'TR': return '❌';
      case 'FA': return '🔄';
      case 'FR': return '❌';
      case 'OC': return '🛒';
      case 'UR': return '📦';
      case 'RP': return '⏳';
      default: return '🔔';
    }
  };

  const getNotificationTypeColor = (type?: string) => {
    switch (type) {
      case 'RA':
      case 'TA':
      case 'FA': return 'var(--md-tertiary-container)';
      case 'RR':
      case 'TR':
      case 'FR': return 'var(--md-error-container)';
      case 'RE':
      case 'RP': return 'var(--md-secondary-container)';
      case 'OC':
      case 'UR': return 'var(--md-primary-container)';
      case 'NL': return 'var(--md-primary-container)';
      default: return 'var(--md-surface-container-high)';
    }
  };

  const clearFilters = () => {
    setFilter('all');
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (filter !== 'all') count++;
    return count;
  }, [search, filter]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleFilterClick = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter);
    setShowFilters(false); // Close filters on selection
  };

  if (isLoading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>
            Notifications
            {unreadCountData && unreadCountData.unread_count !== undefined && unreadCountData.unread_count > 0 && (
              <span style={{ 
                marginLeft: 'var(--spacing-sm)', 
                fontSize: 'var(--font-size-20)', 
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--md-on-surface-variant)'
              }}>
                ({unreadCountData.unread_count} unread)
              </span>
            )}
          </h1>
        </div>
        <div className="page-header-actions">
          {unreadCountData && unreadCountData.unread_count !== undefined && unreadCountData.unread_count > 0 && (
            <button
              className="btn-secondary"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Summary Statistics Cards */}
      {notificationsData && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => handleFilterClick('all')}
            title={`Total Notifications: ${stats.total}`}
            aria-pressed={filter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--unread ${filter === 'unread' ? 'is-active' : ''}`}
            onClick={() => handleFilterClick('unread')}
            title={`Unread Notifications: ${stats.unread}`}
            aria-pressed={filter === 'unread'}
          >
            <span className="summary-stat-label">Unread</span>
            <span className="summary-stat-value">{(stats.unread ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--read ${filter === 'read' ? 'is-active' : ''}`}
            onClick={() => handleFilterClick('read')}
            title={`Read Notifications: ${stats.read}`}
            aria-pressed={filter === 'read'}
          >
            <span className="summary-stat-label">Read</span>
            <span className="summary-stat-value">{(stats.read ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search notifications by title, message, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button 
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <span>🔍 Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <div className="filter-chips">
        <button
                  className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('all')}
        >
          All
        </button>
        <button
                  className={`filter-chip ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('unread')}
        >
                  Unread ({stats.unread})
        </button>
        <button
                  className={`filter-chip ${filter === 'read' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('read')}
        >
                  Read ({stats.read})
        </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search || filter !== 'all'
              ? 'No matching notifications found' 
              : 'No notifications'}
          </h3>
          <p>
            {search || filter !== 'all'
              ? 'Try adjusting your search terms or filters to see more notifications.'
              : 'There are no notifications in the system.'}
          </p>
          {(search || filter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
          </div>
        ) : (
        <div className="notifications-list-container">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              getNotificationIcon={getNotificationIcon}
              getNotificationTypeColor={getNotificationTypeColor}
              formatDate={formatDate}
              onMarkRead={(id) => id && markReadMutation.mutate(id)}
              onOpen={handleNotificationClick}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {notificationsData && notificationsData.count && notificationsData.count > 0 ? (
        <div className="pagination-section">
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!notificationsData?.previous || page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {Math.ceil((notificationsData.count || 0) / pageSize)} ({notificationsData.count || 0} total)
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!notificationsData?.next}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
          <div className="page-size-controls">
            <label htmlFor="page-size-select">Items per page:</label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Notification Card Component
interface NotificationCardProps {
  notification: Notification;
  getNotificationIcon: (type?: string) => string;
  getNotificationTypeColor: (type?: string) => string;
  formatDate: (dateString?: string) => string;
  onMarkRead: (id: number) => void;
  onOpen?: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  getNotificationIcon,
  getNotificationTypeColor,
  formatDate,
  onMarkRead,
  onOpen,
}) => {
  const getIconTextColor = (type?: string) => {
    switch (type) {
      case 'RA':
      case 'TA':
      case 'FA': return 'var(--md-on-tertiary-container)';
      case 'RR':
      case 'TR':
      case 'FR': return 'var(--md-on-error-container)';
      case 'RE':
      case 'RP': return 'var(--md-on-secondary-container)';
      case 'OC':
      case 'UR':
      case 'NL': return 'var(--md-on-primary-container)';
      default: return 'var(--md-on-surface-variant)';
    }
  };

  return (
    <div
      className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
      onClick={() => onOpen?.(notification)}
      onKeyDown={(event) => {
        if (!onOpen) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(notification);
        }
      }}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <div className="notification-card-header">
        <div 
          className="notification-card-icon" 
          style={{ 
            backgroundColor: getNotificationTypeColor(notification.notification_type),
            color: getIconTextColor(notification.notification_type)
          }}
        >
          {getNotificationIcon(notification.notification_type)}
        </div>
        <div className="notification-card-title">{notification.title}</div>
        {!notification.is_read && (
          <button
            className="btn-mark-read"
            onClick={(e) => {
              e.stopPropagation();
              if (notification.id) {
                onMarkRead(notification.id);
              }
            }}
            title="Mark as read"
          >
            Mark read
          </button>
        )}
      </div>
      <div className="notification-card-message">{notification.message}</div>
      <div className="notification-card-footer">
        <span className="notification-type">{notification.notification_type_display || notification.notification_type}</span>
        <span className="notification-date">{formatDate(notification.created_at)}</span>
      </div>
    </div>
  );
};
