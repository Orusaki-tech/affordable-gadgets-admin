import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService, Notification } from '../api/index';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previousUnreadCount = useRef(0);
  const previousNotifications = useRef<Notification[]>([]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  // Fetch unread count - poll more frequently for new leads
  // Note: Backend returns {unread_count: number} but type says Notification, so we cast
  const { data: unreadCountData, refetch: refetchCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await NotificationsService.notificationsUnreadCountRetrieve();
      return response as any; // Backend returns {unread_count: number} not Notification
    },
    refetchInterval: 5000, // Poll every 5 seconds (lightweight - just checking count)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch notifications - poll to detect new leads
  const [page] = useState(1);
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications-recent', page],
    queryFn: async () => {
      const response = await NotificationsService.notificationsList(page);
      return response;
    },
    enabled: showDropdown, // Only fetch when modal is open
    refetchInterval: showDropdown ? 10000 : false, // Poll every 10 seconds when modal is open
    refetchOnWindowFocus: true,
  });

  // Detect new notifications and handle them appropriately
  useEffect(() => {
    const currentUnread = (unreadCountData as any)?.unread_count || 0;
    const currentNotifications = notificationsData?.results || [];
    
    // Check if unread count increased (new notification arrived)
    if (currentUnread > previousUnreadCount.current) {
      // Check if any new notifications arrived
      const newNotifications = currentNotifications.filter(
        (n: Notification) => !previousNotifications.current.some((prev) => prev.id === n.id)
      );
      
      // Handle new lead notifications
      const hasNewLead = newNotifications.some((n: Notification) => n.notification_type === 'NL');
      if (hasNewLead) {
        // Invalidate leads cache to trigger refresh
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        
        // Show browser notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
          const leadNotification = newNotifications.find((n: Notification) => n.notification_type === 'NL');
          if (leadNotification && leadNotification.title) {
            new window.Notification(leadNotification.title, {
              body: leadNotification.message || '',
              icon: '/favicon.ico',
              tag: `lead-${leadNotification.object_id || ''}`,
            });
          }
        }
      }
      
      // Handle reservation approval/rejection notifications
      const hasReservationUpdate = newNotifications.some((n: Notification) => n.notification_type === 'RA' || n.notification_type === 'RR');
      if (hasReservationUpdate) {
        // Invalidate reservation requests cache to trigger refresh
        queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
        
        // Show browser notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
          const reservationNotification = newNotifications.find((n: Notification) => n.notification_type === 'RA' || n.notification_type === 'RR');
          if (reservationNotification && reservationNotification.title) {
            new window.Notification(reservationNotification.title, {
              body: reservationNotification.message || '',
              icon: '/favicon.ico',
              tag: `reservation-${reservationNotification.object_id || ''}`,
            });
          }
        }
      }
    }
    
    previousUnreadCount.current = currentUnread;
    previousNotifications.current = currentNotifications;
  }, [unreadCountData, notificationsData, queryClient]);

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
      refetchCount();
      refetchNotifications();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      // Mark all unread as read
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
      refetchCount();
      refetchNotifications();
    },
  });

  const unreadCount = (unreadCountData as any)?.unread_count || 0;
  const notifications = notificationsData?.results || [];

  const handleNotificationClick = (notification: Notification) => {
    if (notification.id && !notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    setShowDropdown(false);
    // Navigate based on notification type
    if (notification.notification_type === 'NL') {
      navigate('/leads');
    } else if (notification.notification_type === 'RP') {
      // REQUEST_PENDING_APPROVAL - navigate to reservation requests page
      // Filter to pending requests since these are new requests needing approval
      navigate('/reservation-requests?status=PE');
    } else {
      navigate('/notifications');
    }
  };

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
      case 'NL': return '📞'; // New Lead
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="modal-overlay" onClick={() => setShowDropdown(false)}>
          <div className="modal-content modal-large notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</h2>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    className="btn-secondary"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    style={{ fontSize: 'var(--font-size-12)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                  >
                    Mark all read
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowDropdown(false)}>×</button>
              </div>
            </div>
            
            <div className="modal-body notification-modal-body">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <h3>No notifications</h3>
                  <p>You're all caught up! No new notifications.</p>
                </div>
              ) : (
                <div className="notifications-list-container">
                  {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                      className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notification-card-header">
                        <div className="notification-card-icon" style={{ 
                          backgroundColor: notification.notification_type === 'RA' || notification.notification_type === 'TA' || notification.notification_type === 'FA' 
                            ? 'var(--md-tertiary-container)' 
                            : notification.notification_type === 'RR' || notification.notification_type === 'TR' || notification.notification_type === 'FR'
                            ? 'var(--md-error-container)'
                            : notification.notification_type === 'RE' || notification.notification_type === 'RP'
                            ? 'var(--md-secondary-container)'
                            : notification.notification_type === 'OC' || notification.notification_type === 'UR'
                            ? 'var(--md-primary-container)'
                            : 'var(--md-surface-container-high)'
                        }}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                        <div className="notification-card-title">{notification.title}</div>
                        {!notification.is_read && (
                          <button
                            className="btn-mark-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notification.id) {
                                markReadMutation.mutate(notification.id);
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
                  ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

