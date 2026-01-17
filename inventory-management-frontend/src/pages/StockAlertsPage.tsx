import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService, StockAlertsService, ProductsService, StockAlert, StockAlertsResponse, StockAlertType } from '../api/index';

export const StockAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDescription, setShowDescription] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'medium' | ''>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'severity' | 'type' | 'default'>('severity');
  const [groupBySeverity, setGroupBySeverity] = useState(true);
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, { loading: boolean; error: boolean }>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const { data, isLoading, error, refetch } = useQuery<StockAlertsResponse>({
    queryKey: ['stock-alerts'],
    queryFn: async (): Promise<StockAlertsResponse> => {
      const response = await StockAlertsService.stockAlertsRetrieve();
      setLastUpdated(new Date());
      return response as StockAlertsResponse;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch product images for alerts with product_id
  useEffect(() => {
    if (!data?.alerts) return;

    const productIds = data.alerts
      .filter(alert => alert.product_id && !productImages[alert.product_id])
      .map(alert => alert.product_id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Unique IDs

    if (productIds.length === 0) return;

    const fetchProductImages = async () => {
      const imageMap: Record<number, string | null> = {};
      
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const product = await ProductsService.productsRetrieve(productId);
            // images is typed as string but actually returns an array from the API
            const imagesArray = typeof product.images === 'string' ? (product.images ? JSON.parse(product.images) : []) : (product.images as any);
            const firstImage = Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
            const imageUrl = firstImage 
              ? (firstImage.image_url || firstImage.image || (typeof firstImage === 'string' ? firstImage : null))
              : null;
            const fullImageUrl = imageUrl 
              ? (imageUrl.startsWith('http') || imageUrl.startsWith('//') 
                  ? imageUrl 
                  : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
              : null;
            
            imageMap[productId] = fullImageUrl || null;
            
            if (fullImageUrl) {
              setImageLoadingStates(prev => ({
                ...prev,
                [`product-${productId}`]: { loading: true, error: false }
              }));
            }
          } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            imageMap[productId] = null;
          }
        })
      );
      
      setProductImages(prev => ({ ...prev, ...imageMap }));
    };

    fetchProductImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.alerts]);

  const formatAlertType = (type: string | undefined) => {
    if (!type) return '';
    const words = type.split('_');
    const lowercaseWords = ['of', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with'];
    
    return words
      .map((word, index) => {
        const lowerWord = word.toLowerCase();
        // Capitalize first word, or if it's not a common lowercase word
        if (index === 0 || !lowercaseWords.includes(lowerWord)) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return lowerWord;
      })
      .join(' ');
  };

  // Filter and sort alerts with search
  const filteredAndSortedAlerts = useMemo(() => {
    if (!data?.alerts) return [];
    
    let filtered = data.alerts;
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.title?.toLowerCase().includes(searchLower) ||
        alert.message?.toLowerCase().includes(searchLower) ||
        alert.product_name?.toLowerCase().includes(searchLower) ||
        formatAlertType(alert.type || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Apply severity filter from button clicks
    if (activeFilter && activeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === activeFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }
    
    // Sort alerts
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder: Record<string, number> = {
          'critical': 0,
          'high': 1,
          'medium': 2,
          'low': 3,
        };
        const aSeverity = a.severity || 'low';
        const bSeverity = b.severity || 'low';
        return (severityOrder[aSeverity] || 99) - (severityOrder[bSeverity] || 99);
      } else if (sortBy === 'type') {
        return (a.type || '').localeCompare(b.type || '');
      }
      return 0;
    });
    
    return sorted;
  }, [data, search, activeFilter, typeFilter, sortBy]);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '•';
    }
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime(); // Time remaining until expiration
      
      if (diffMs < 0) return 'Expired';
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return 'Less than 1m';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    } catch {
      return null;
    }
  };

  const handleAlertAction = (alert: StockAlert, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (alert.link) {
      navigate(alert.link);
    } else if (alert.product_id) {
      navigate(`/products/${alert.product_id}/units`);
    } else if (alert.unit_id) {
      navigate(`/units`);
    }
  };

  // Group alerts by severity
  const groupedAlerts = useMemo(() => {
    if (!groupBySeverity) {
      return { all: filteredAndSortedAlerts };
    }
    
    const groups: Record<string, StockAlert[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    
    filteredAndSortedAlerts.forEach(alert => {
      const severity = alert.severity || 'low';
      if (groups[severity]) {
        groups[severity].push(alert);
      }
    });
    
    return groups;
  }, [filteredAndSortedAlerts, groupBySeverity]);

  const clearFilters = () => {
    setSearch('');
    setActiveFilter('');
    setTypeFilter('');
  };

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (activeFilter !== '' && activeFilter !== 'all') count++;
    if (typeFilter) count++;
    if (sortBy !== 'severity') count++;
    if (!groupBySeverity) count++; // Only count if it's different from default
    return count;
  }, [search, activeFilter, typeFilter, sortBy, groupBySeverity]);

  // Role checks and redirect (after all hooks are declared)
  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isInventoryManager = hasRole('IM');
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isSalesperson = hasRole('SP') && !isSuperuser;

  // Redirect unauthorized users (only Inventory Managers and Superusers can access)
  if (!isLoadingProfile && !isInventoryManager && !isSuperuser) {
    if (isContentCreator) {
      return <Navigate to="/content-creator/dashboard" replace />;
    }
    if (isSalesperson) {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleFilterClick = (filter: 'all' | 'critical' | 'high' | 'medium') => {
    if (filter === 'all') {
      // Total Alerts - show all (clear filter)
      setActiveFilter('');
    } else if (activeFilter === filter) {
      // If clicking the same filter, clear it
      setActiveFilter('');
    } else {
      setActiveFilter(filter);
    }
    // Clear other filters when using button filters
    setTypeFilter('');
    setSearch('');
  };


  const handleExportCSV = () => {
    const alertsToExport = filteredAndSortedAlerts.length > 0 
      ? filteredAndSortedAlerts 
      : (data?.alerts || []);
    
    const headers = ['ID', 'Type', 'Severity', 'Title', 'Message', 'Product Name', 'Product ID', 'Current Stock', 'Min Threshold', 'Action'];
    const rows = alertsToExport.map(alert => [
      alert.id,
      formatAlertType(alert.type || ''),
      alert.severity || '',
      alert.title || '',
      alert.message || '',
      alert.product_name || '',
      alert.product_id || '',
      alert.current_stock || '',
      alert.min_threshold || '',
      alert.action || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-alerts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffMins < 1) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastUpdated.toLocaleString();
  };

  if (isLoading) {
    return <div className="loading">Loading stock alerts...</div>;
  }

  if (error) {
    return <div className="error">Error loading alerts: {(error as Error).message}</div>;
  }

  return (
    <div className="stock-alerts-page">
      <div className="page-header">
        <div>
          <h1>Stock Alerts</h1>
          <p className="page-subtitle">
            Monitor inventory levels and pending actions
            {lastUpdated && (
              <span className="last-updated"> • Last updated: {formatLastUpdated()}</span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <div className="utility-actions">
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
            <button className="btn-secondary" onClick={handleExportCSV}>
              📥 Export CSV
            </button>
            <button className="btn-refresh" onClick={() => refetch()}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="alerts-filters">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search alerts by title, message, or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {(search || activeFilter || typeFilter) && (
              <button
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>
          <div className="filters-row">

            <div className="filter-group">
              <label htmlFor="type-filter">Filter by Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="expiring_reservation">Expiring Reservations</option>
                <option value="pending_approval">Pending Approvals</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-by">Sort By</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'severity' | 'type' | 'default')}
                className="filter-select"
              >
                <option value="severity">Severity</option>
                <option value="type">Type</option>
                <option value="default">Default</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={groupBySeverity}
                  onChange={(e) => setGroupBySeverity(e.target.checked)}
                />
                <span>Group by Severity</span>
              </label>
            </div>

          </div>
        </div>
      )}

      <div className="info-box">
        <button 
          className="info-toggle" 
          onClick={() => setShowDescription(!showDescription)}
          aria-expanded={showDescription}
        >
          <span>ℹ️</span>
          <span>How are Stock Alerts Determined?</span>
          <span className="toggle-icon">{showDescription ? '▼' : '▶'}</span>
        </button>
        
        {showDescription && (
          <div className="info-content">
            <div className="info-section">
              <h3>🚨 Out of Stock (Critical)</h3>
              <p>Triggered when a product has <strong>0 available units</strong> and is not discontinued.</p>
              <p className="info-detail">Severity: Critical - Requires immediate attention</p>
            </div>
            
            <div className="info-section">
              <h3>⚠️ Low Stock (High/Medium)</h3>
              <p>Triggered when available units fall <strong>below the minimum threshold</strong> set for a product.</p>
              <p className="info-detail">Severity: High if at 0, Medium if below threshold</p>
              <p className="info-note">💡 Set a <code>min_stock_threshold</code> on products to enable this alert</p>
            </div>
            
            <div className="info-section">
              <h3>⚡ Expiring Reservations (High/Medium)</h3>
              <p>Triggered when reserved units are <strong>expiring within 24 hours</strong>.</p>
              <p className="info-detail">Severity: High if less than 6 hours remaining, Medium if 6-24 hours</p>
              <p className="info-note">Shows unit ID, who reserved it, and hours remaining</p>
            </div>
            
            <div className="info-section">
              <h3>ℹ️ Pending Approvals (Low)</h3>
              <p>Triggered when there are <strong>pending requests</strong> waiting for approval:</p>
              <ul>
                <li>Reservation Requests</li>
                <li>Return Requests</li>
                <li>Unit Transfers</li>
              </ul>
              <p className="info-detail">Severity: Low - Review and approve when convenient</p>
            </div>
            
            <div className="info-footer">
              <p><strong>Note:</strong> Alerts refresh automatically every 60 seconds. Click the refresh button to update manually.</p>
            </div>
          </div>
        )}
      </div>

      {/* Always show summary buttons for context */}
      {data && (
        <div className="alerts-summary">
          <button
            className={`summary-filter-btn summary-filter-total ${activeFilter === '' ? 'active' : ''}`}
            onClick={() => handleFilterClick('all')}
          >
            Total Alerts {data?.count ? `(${data.count})` : ''}
          </button>
          <button
            className={`summary-filter-btn summary-filter-critical ${activeFilter === 'critical' ? 'active' : ''}`}
            onClick={() => handleFilterClick('critical')}
          >
            Critical Alerts ({(data?.alerts || []).filter(a => a.severity === 'critical').length || 0})
          </button>
          <button
            className={`summary-filter-btn summary-filter-high ${activeFilter === 'high' ? 'active' : ''}`}
            onClick={() => handleFilterClick('high')}
          >
            High ({(data?.alerts || []).filter(a => a.severity === 'high').length || 0})
          </button>
          <button
            className={`summary-filter-btn summary-filter-medium ${activeFilter === 'medium' ? 'active' : ''}`}
            onClick={() => handleFilterClick('medium')}
          >
            Medium ({(data?.alerts || []).filter(a => a.severity === 'medium').length || 0})
          </button>
        </div>
      )}

      {data && data.count === 0 ? (
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <h2>All Clear!</h2>
          <p>No stock alerts at this time. Everything is running smoothly.</p>
        </div>
      ) : filteredAndSortedAlerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Alerts Match Your Selection</h3>
          <p>
            {(search || activeFilter || typeFilter)
              ? 'Try adjusting your search terms or filters to see more alerts.'
              : 'No alerts match your criteria.'}
          </p>
          {(search || activeFilter || typeFilter) && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>

          {groupBySeverity ? (
            // Grouped view
            <div className="alerts-grouped">
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                const severityAlerts = groupedAlerts[severity] || [];
                if (severityAlerts.length === 0) return null;
                
                return (
                  <div key={severity} className={`severity-group severity-group-${severity}`}>
                    <div className="severity-group-header">
                      <div className="severity-group-title">
                        <span className="severity-group-icon">{getSeverityIcon(severity)}</span>
                        <h2>{severity.charAt(0).toUpperCase() + severity.slice(1)} Priority</h2>
                        <span className="severity-group-count">({severityAlerts.length})</span>
                      </div>
                    </div>
                    <div className="alerts-grid">
                      {severityAlerts.map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          getSeverityClass={getSeverityClass}
                          getSeverityIcon={getSeverityIcon}
                          formatAlertType={formatAlertType}
                          formatTimeAgo={formatTimeAgo}
                          handleAlertAction={handleAlertAction}
                          productImage={alert.product_id ? productImages[alert.product_id] : null}
                          imageLoadingState={alert.product_id ? imageLoadingStates[`product-${alert.product_id}`] : undefined}
                          onImageLoad={() => {
                            if (alert.product_id) {
                              setImageLoadingStates(prev => ({
                                ...prev,
                                [`product-${alert.product_id}`]: { loading: false, error: false }
                              }));
                            }
                          }}
                          onImageError={() => {
                            if (alert.product_id) {
                              setImageLoadingStates(prev => ({
                                ...prev,
                                [`product-${alert.product_id}`]: { loading: false, error: true }
                              }));
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Ungrouped view
            <div className="alerts-grid">
              {filteredAndSortedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  getSeverityClass={getSeverityClass}
                  getSeverityIcon={getSeverityIcon}
                  formatAlertType={formatAlertType}
                  formatTimeAgo={formatTimeAgo}
                  handleAlertAction={handleAlertAction}
                  productImage={alert.product_id ? productImages[alert.product_id] : null}
                  imageLoadingState={alert.product_id ? imageLoadingStates[`product-${alert.product_id}`] : undefined}
                  onImageLoad={() => {
                    if (alert.product_id) {
                      setImageLoadingStates(prev => ({
                        ...prev,
                        [`product-${alert.product_id}`]: { loading: false, error: false }
                      }));
                    }
                  }}
                  onImageError={() => {
                    if (alert.product_id) {
                      setImageLoadingStates(prev => ({
                        ...prev,
                        [`product-${alert.product_id}`]: { loading: false, error: true }
                      }));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Alert Card Component
interface AlertCardProps {
  alert: StockAlert;
  getSeverityClass: (severity: string) => string;
  getSeverityIcon: (severity: string) => string;
  formatAlertType: (type: string | undefined) => string;
  formatTimeAgo: (dateString: string | undefined) => string | null;
  handleAlertAction: (alert: StockAlert, e?: React.MouseEvent) => void;
  productImage?: string | null;
  imageLoadingState?: { loading: boolean; error: boolean };
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  getSeverityClass,
  getSeverityIcon,
  formatAlertType,
  formatTimeAgo,
  handleAlertAction,
  productImage,
  imageLoadingState,
  onImageLoad,
  onImageError,
}) => {
  const showImage = alert.product_id && (alert.type === StockAlertType.OUT_OF_STOCK || alert.type === StockAlertType.LOW_STOCK);
  const imageLoading = imageLoadingState?.loading ?? false;
  const imageError = imageLoadingState?.error ?? false;

  return (
    <div 
      className={`alert-card ${getSeverityClass(alert.severity || 'low')}`}
      onClick={() => handleAlertAction(alert)}
    >
      {showImage && (
        <div className="alert-card-image">
          {productImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="image-loading-overlay">
                  <div className="image-loading-spinner"></div>
                </div>
              )}
              <img 
                src={productImage} 
                alt={alert.product_name || 'Product image'} 
                onLoad={onImageLoad}
                onError={onImageError}
                style={{ opacity: imageLoading ? 0 : 1 }}
              />
            </>
          ) : (
            <div className="alert-card-placeholder">
              <span>📷</span>
              <span>No Image</span>
            </div>
          )}
        </div>
      )}
      
      <div className="alert-header">
        <div className={`alert-type-badge severity-${alert.severity || 'low'}`}>
          <span className="severity-icon">{getSeverityIcon(alert.severity || 'low')}</span>
          <span className="severity-label">{(alert.severity || 'low').toUpperCase()}</span>
          <span className="alert-type-text">{formatAlertType(alert.type || '')}</span>
        </div>
      </div>
      <div className="alert-body">
        <h3 className="alert-title">{alert.title || ''}</h3>
        <p className="alert-message">{alert.message || ''}</p>
        
        {/* Show timestamp if available */}
        {alert.expires_at && (
          <div className="alert-timestamp">
            <span className="timestamp-label">Expires in:</span>
            <span className="timestamp-value">{formatTimeAgo(alert.expires_at) || 'N/A'}</span>
          </div>
        )}
        
        {/* Show additional context based on alert type */}
        {alert.type === StockAlertType.LOW_STOCK && alert.current_stock !== undefined && (
          <div className="alert-details">
            <div className="detail-item">
              <span className="detail-label">Current Stock:</span>
              <span className="detail-value">{alert.current_stock}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Minimum:</span>
              <span className="detail-value">{alert.min_threshold}</span>
            </div>
          </div>
        )}
        
        {alert.type === StockAlertType.EXPIRING_RESERVATION && (
          <div className="alert-details">
            <div className="detail-item">
              <span className="detail-label">Reserved by:</span>
              <span className="detail-value">{alert.reserved_by || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expires in:</span>
              <span className="detail-value critical-time">
                {alert.hours_remaining !== undefined && alert.hours_remaining !== null ? `${Math.round(alert.hours_remaining)}h` : 'N/A'}
              </span>
            </div>
          </div>
        )}
        
        {alert.type === StockAlertType.PENDING_APPROVAL && alert.count !== undefined && (
          <div className="alert-details">
            <div className="detail-item">
              <span className="detail-label">Pending:</span>
              <span className="detail-value">{alert.count} request(s)</span>
            </div>
          </div>
        )}
      </div>
      <div className="alert-footer">
        <button 
          className="btn-action"
          onClick={(e) => handleAlertAction(alert, e)}
        >
          {(alert.action || '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} →
        </button>
      </div>
    </div>
  );
};

