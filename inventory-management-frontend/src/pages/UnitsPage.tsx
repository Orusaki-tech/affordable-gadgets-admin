import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  UnitsService,
  InventoryUnitRW,
  ProfilesService,
} from '../api/index';
import { UnitForm } from '../components/UnitForm';
import { UnitDetailsModal } from '../components/UnitDetailsModal';

export const UnitsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingUnit, setEditingUnit] = useState<InventoryUnitRW | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Set<number>>(new Set());
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, { loading: boolean; error: boolean }>>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // CSV Export
  const handleExport = () => {
    const queryString = buildQueryString();
    window.open(`/api/inventory/units/export_csv/?${queryString}`, '_blank');
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.sale_status) params.append('sale_status', filters.sale_status);
    if (filters.min_price) params.append('selling_price__gte', filters.min_price);
    if (filters.max_price) params.append('selling_price__lte', filters.max_price);
    return params.toString();
  };

  // Fetch admin profile to check roles
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff && isAuthenticated,
  });

  // Check superuser status from adminProfile.user if available
  const isSuperuser = adminProfile?.user?.is_superuser === true;

  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  // Filters state
  const [filters, setFilters] = useState({
    product_type: '',
    brand: '',
    condition: '',
    sale_status: '',
    min_price: '',
    max_price: '',
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.condition) count++;
    if (filters.sale_status) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    return count;
  }, [filters]);

  // Role checks and redirect (after all hooks are declared)
  // const isSalesperson = hasRole('SP'); // Unused - all actions now in modal
  const isInventoryManager = hasRole('IM');
  // const isMarketingManager = hasRole('MM') && !isSuperuser; // Unused

  const { data, isLoading, error } = useQuery({
    queryKey: ['units', page, filters, search],
    queryFn: async () => {
      // Note: The API supports filtering via query params, but we'll do client-side for now
      // You can enhance this to use actual API filtering
      const result = await UnitsService.unitsList(undefined, undefined, page);
      return result;
    },
    enabled: !authLoading && isAuthenticated, // Only run query when authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  const handleCreate = () => {
    setEditingUnit(null);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingUnit(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      product_type: '',
      brand: '',
      condition: '',
      sale_status: '',
      min_price: '',
      max_price: '',
    });
    setSearch('');
    setPage(1);
  };

  // Helper function to get sale status badge info
  const getSaleStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      'AV': { label: 'Available', color: '#155724', bgColor: '#d4edda' },
      'SD': { label: 'Sold', color: '#856404', bgColor: '#fff3cd' },
      'RS': { label: 'Reserved', color: '#8a6d3b', bgColor: '#fff4cc' },
      'RT': { label: 'Returned', color: '#721c24', bgColor: '#f8d7da' },
      'PP': { label: 'Pending Payment', color: '#084298', bgColor: '#cfe2ff' },
    };
    
    return statusMap[status] || null;
  };

  // Bulk operations mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ operation, data }: { operation: string; data: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/units/bulk_update/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit_ids: Array.from(selectedUnits),
          operation,
          data,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk operation failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      showToast(data.message, 'success');
      setSelectedUnits(new Set());
      setShowBulkPriceModal(false);
      setShowBulkStatusModal(false);
    },
    onError: (error: any) => {
      showToast(error.message || 'Bulk operation failed', 'error');
    },
  });

  // Selection handlers
  const toggleSelectUnit = (unitId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnits(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUnits.size === filteredUnits.length) {
      setSelectedUnits(new Set());
    } else {
      setSelectedUnits(new Set(filteredUnits.map(u => u.id!).filter(id => id)));
    }
  };

  const handleBulkPriceUpdate = (newPrice: string) => {
    if (!newPrice || isNaN(parseFloat(newPrice))) {
      showToast('Please enter a valid price', 'error');
      return;
    }
    bulkUpdateMutation.mutate({
      operation: 'update_price',
      data: { selling_price: parseFloat(newPrice) },
    });
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    if (!newStatus) {
      showToast('Please select a status', 'error');
      return;
    }
    bulkUpdateMutation.mutate({
      operation: 'update_status',
      data: { sale_status: newStatus },
    });
  };

  const handleBulkArchive = () => {
    if (window.confirm(`Archive ${selectedUnits.size} sold unit(s)? This action cannot be undone.`)) {
      bulkUpdateMutation.mutate({
        operation: 'archive',
        data: {},
      });
    }
  };

  // Client-side filtering (can be enhanced to use API filters)
  const filteredUnits = data?.results?.filter((unit) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        unit.serial_number?.toLowerCase().includes(searchLower) ||
        unit.imei?.toLowerCase().includes(searchLower) ||
        unit.product_template_name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter by product type (if product_template has type info - simplified)
    // Note: This is simplified - in real implementation, you'd need to fetch product details
    
    // Filter by condition
    if (filters.condition && unit.condition !== filters.condition) return false;
    
    // Filter by sale status
    if (filters.sale_status && unit.sale_status !== filters.sale_status) return false;
    
    // Filter by price range
    if (filters.min_price && unit.selling_price) {
      const price = Number(unit.selling_price);
      if (price < parseFloat(filters.min_price)) return false;
    }
    if (filters.max_price && unit.selling_price) {
      const price = Number(unit.selling_price);
      if (price > parseFloat(filters.max_price)) return false;
    }

    return true;
  }) || [];

  // Initialize image loading states for units with images
  useEffect(() => {
    if (filteredUnits.length > 0) {
      const newStates: Record<number, { loading: boolean; error: boolean }> = {};
      filteredUnits.forEach(unit => {
        if (unit.id) {
          // images is typed as string but actually returns an array from the API
          const imagesArray = typeof unit.images === 'string' ? (unit.images ? JSON.parse(unit.images) : []) : (unit.images as any);
          const firstImage = Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
          const imageUrl = firstImage 
            ? (firstImage.image_url || (firstImage as any).image || null)
            : null;
          const fullImageUrl = imageUrl 
            ? (imageUrl.startsWith('http') || imageUrl.startsWith('//') 
                ? imageUrl 
                : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
            : null;
          
          if (fullImageUrl && !imageLoadingStates[unit.id]) {
            newStates[unit.id] = { loading: true, error: false };
          }
        }
      });
      
      if (Object.keys(newStates).length > 0) {
        setImageLoadingStates(prev => ({ ...prev, ...newStates }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUnits]);

  // Role checks and redirect (after all hooks are declared)
  const isInventoryManagerCheck = hasRole('IM');
  const isMarketingManagerCheck = hasRole('MM') && !isSuperuser;
  const isContentCreatorCheck = hasRole('CC') && !isSuperuser;
  const isSalespersonCheck = hasRole('SP') && !isSuperuser;

  // Redirect unauthorized users
  if (!authLoading && isAuthenticated && !isInventoryManagerCheck && !isSuperuser && !isContentCreatorCheck && !isSalespersonCheck && !isMarketingManagerCheck) {
    // For non-staff users or users without any role, redirect to products
    return <Navigate to="/products" replace />;
  }
  if (!authLoading && isAuthenticated && isContentCreatorCheck) {
    // Content Creators should not access inventory units
    return <Navigate to="/content-creator/dashboard" replace />;
  }

  const getNextPage = () => {
    if (data?.next) {
      setPage(page + 1);
    }
  };

  const getPrevPage = () => {
    if (data?.previous) {
      setPage(page - 1);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading units...</div>;
  }

  if (error) {
    const apiError = error as any;
    // Handle authentication errors by redirecting
    if (apiError?.status === 401 || apiError?.status === 403) {
      // Use logout function which properly clears auth state
      logout();
      navigate('/login');
      return <div className="loading">Redirecting to login...</div>;
    }
    return <div className="error">Error loading units: {apiError?.message || (error as Error).message || 'Unknown error'}</div>;
  }

  return (
    <div className="units-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="page-header">
        <h1>Inventory Units</h1>
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
            {(isInventoryManager || isSuperuser) && (
              <>
                <button className="btn-secondary" onClick={handleExport}>
                  📥 Export CSV
                </button>
                <button className="btn-secondary" onClick={() => setShowImportModal(true)}>
                  📤 Import CSV
                </button>
                <button className="btn-primary" onClick={handleCreate}>
                  + Create Unit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {(isInventoryManager || isSuperuser) && selectedUnits.size > 0 && (
        <div className="bulk-actions-toolbar">
          <div className="bulk-actions-left">
            <span className="selected-count">
              {selectedUnits.size} unit{selectedUnits.size !== 1 ? 's' : ''} selected
            </span>
            <button
              className="btn-small btn-secondary"
              onClick={() => setSelectedUnits(new Set())}
            >
              Clear Selection
            </button>
          </div>
          <div className="bulk-actions-buttons">
            <button
              className="btn-small btn-primary"
              onClick={() => setShowBulkPriceModal(true)}
              disabled={bulkUpdateMutation.isPending}
            >
              💰 Update Price
            </button>
            <button
              className="btn-small btn-primary"
              onClick={() => setShowBulkStatusModal(true)}
              disabled={bulkUpdateMutation.isPending}
            >
              🔄 Change Status
            </button>
            <button
              className="btn-small btn-danger"
              onClick={handleBulkArchive}
              disabled={bulkUpdateMutation.isPending}
            >
              📦 Archive Sold
            </button>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-row">
          {(isInventoryManager || isSuperuser) && filteredUnits.length > 0 && (
            <label className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedUnits.size === filteredUnits.length && filteredUnits.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Select All ({filteredUnits.length})</span>
            </label>
          )}
          <input
            type="text"
            placeholder="Search by serial, IMEI, or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {(search || activeFilterCount > 0) && (
            <button
              className="btn-clear-filters"
              onClick={clearFilters}
            >
              Clear All
          </button>
          )}
        </div>

        {showFilters && (
          <>
            {/* Desktop: Inline filters */}
            <div className="filters-panel filters-panel-desktop">
              <div className="filter-group">
                <label htmlFor="filter-condition">Condition</label>
                <select
                  id="filter-condition"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Conditions</option>
                  <option value="N">New (N)</option>
                  <option value="R">Refurbished (R)</option>
                  <option value="P">Pre-owned (P)</option>
                  <option value="D">Defective (D)</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-sale-status">Sale Status</label>
                <select
                  id="filter-sale-status"
                  value={filters.sale_status}
                  onChange={(e) => handleFilterChange('sale_status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="AV">Available (AV)</option>
                  <option value="SD">Sold (SD)</option>
                  <option value="RS">Reserved (RS)</option>
                  <option value="RT">Returned (RT)</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-min-price">Min Price</label>
                <input
                  id="filter-min-price"
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="filter-select"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filter-max-price">Max Price</label>
                <input
                  id="filter-max-price"
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="filter-select"
                />
              </div>
            </div>

            {/* Mobile: Modal overlay */}
            <div className="filters-modal-overlay" onClick={() => setShowFilters(false)}>
              <div className="filters-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="filters-modal-header">
                  <h2>Filters</h2>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                  >
                    ×
                  </button>
                </div>
                <div className="form-section">
          <div className="form-group">
                    <label htmlFor="filter-condition-mobile">Condition</label>
            <select
                      id="filter-condition-mobile"
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
            >
                      <option value="">All Conditions</option>
              <option value="N">New (N)</option>
              <option value="R">Refurbished (R)</option>
              <option value="P">Pre-owned (P)</option>
              <option value="D">Defective (D)</option>
            </select>
          </div>

          <div className="form-group">
                    <label htmlFor="filter-sale-status-mobile">Sale Status</label>
            <select
                      id="filter-sale-status-mobile"
              value={filters.sale_status}
              onChange={(e) => handleFilterChange('sale_status', e.target.value)}
            >
                      <option value="">All Status</option>
              <option value="AV">Available (AV)</option>
              <option value="SD">Sold (SD)</option>
              <option value="RS">Reserved (RS)</option>
              <option value="RT">Returned (RT)</option>
            </select>
          </div>

          <div className="form-group">
                    <label htmlFor="filter-min-price-mobile">Min Price</label>
            <input
                      id="filter-min-price-mobile"
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
            />
          </div>

          <div className="form-group">
                    <label htmlFor="filter-max-price-mobile">Max Price</label>
            <input
                      id="filter-max-price-mobile"
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
            />
          </div>
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn-secondary" 
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </button>
                </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {filteredUnits.length === 0 ? (
        <div className="empty-state">
          No units found
        </div>
      ) : (
        <div className="product-units-grid">
          {filteredUnits.map((unit) => {
            // Get first image URL from InventoryUnitImage
            // images is typed as string but actually returns an array from the API
            const imagesArray = typeof unit.images === 'string' ? (unit.images ? JSON.parse(unit.images) : []) : (unit.images as any);
            const firstImage = Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
            const imageUrl = firstImage 
              ? (firstImage.image_url || (firstImage as any).image || null)
              : null;
            const fullImageUrl = imageUrl 
              ? (imageUrl.startsWith('http') || imageUrl.startsWith('//') 
                  ? imageUrl 
                  : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
              : null;


            return (
              <div 
                key={unit.id} 
                className={`product-unit-card ${selectedUnits.has(unit.id!) ? 'card-selected' : ''}`}
                onClick={() => unit.id && setSelectedUnitId(unit.id)}
              >
                {(isInventoryManager || isSuperuser) && (
                  <div className="card-checkbox-overlay">
                    <input
                      type="checkbox"
                      checked={selectedUnits.has(unit.id!)}
                      onChange={(e) => unit.id && toggleSelectUnit(unit.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className="product-unit-card-image">
                  {fullImageUrl && !(imageLoadingStates[unit.id!]?.error) ? (
                    <>
                      {(imageLoadingStates[unit.id!]?.loading !== false) && (
                        <div className="image-loading-overlay">
                          <div className="image-loading-spinner"></div>
                        </div>
                      )}
                      <img 
                        src={fullImageUrl} 
                        alt={unit.product_template_name || 'Unit image'}
                        onLoad={() => {
                          if (unit.id) {
                            setImageLoadingStates(prev => ({
                              ...prev,
                              [unit.id!]: { loading: false, error: false }
                            }));
                          }
                        }}
                        onError={() => {
                          if (unit.id) {
                            setImageLoadingStates(prev => ({
                              ...prev,
                              [unit.id!]: { loading: false, error: true }
                            }));
                          }
                        }}
                        style={{ opacity: imageLoadingStates[unit.id!]?.loading ? 0 : 1 }}
                      />
                    </>
                  ) : (
                    <div className="product-unit-card-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  {unit.images && unit.images.length > 1 && (
                    <div className="image-count-badge">
                      +{unit.images.length - 1}
                    </div>
                  )}
                  {(() => {
                    const statusBadge = getSaleStatusBadge(unit.sale_status);
                    return statusBadge && (
                      <div 
                        className="product-unit-status-badge"
                        style={{ 
                          backgroundColor: statusBadge.bgColor,
                          color: statusBadge.color
                        }}
                      >
                        {statusBadge.label}
                      </div>
                    );
                  })()}
                </div>
                <div className="product-unit-card-content">
                  <h3 className="product-unit-card-name">{unit.product_template_name || 'Unnamed Product'}</h3>
                  <div className="product-unit-card-details">
                    <div className="product-unit-card-detail-item">
                      <span className="detail-label">Condition:</span>
                      <span className="detail-value">{unit.condition || '-'}</span>
                    </div>
                    <div className="product-unit-card-detail-item">
                      <span className="detail-label">Grade:</span>
                      <span className="detail-value">{unit.grade ? String(unit.grade) : '-'}</span>
                    </div>
                    <div className="product-unit-card-detail-item">
                      <span className="detail-label">Storage:</span>
                      <span className="detail-value">{unit.storage_gb ? `${unit.storage_gb} GB` : '-'}</span>
                    </div>
                    <div className="product-unit-card-detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value" data-price={unit.selling_price ? "true" : undefined}>
                        {unit.selling_price ? `KES ${Number(unit.selling_price).toLocaleString()}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={getPrevPage}
          disabled={!data?.previous || page === 1}
          className="btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">
          Page {page} of {data ? Math.ceil((data.count || 0) / 25) : 1}
          {' '}({data?.count || 0} total)
        </span>
        <button
          onClick={getNextPage}
          disabled={!data?.next}
          className="btn-secondary"
        >
          Next
        </button>
      </div>

      {showCreateModal && (
        <UnitForm
          unit={editingUnit}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {selectedUnitId && (
        <UnitDetailsModal
          unitId={selectedUnitId}
          onClose={() => setSelectedUnitId(null)}
          isEditable={isInventoryManager || isSuperuser}
        />
      )}

      {/* Bulk Price Update Modal */}
      {showBulkPriceModal && (
        <BulkPriceModal
          count={selectedUnits.size}
          onClose={() => setShowBulkPriceModal(false)}
          onConfirm={handleBulkPriceUpdate}
          isLoading={bulkUpdateMutation.isPending}
        />
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <BulkStatusModal
          count={selectedUnits.size}
          onClose={() => setShowBulkStatusModal(false)}
          onConfirm={handleBulkStatusUpdate}
          isLoading={bulkUpdateMutation.isPending}
        />
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            queryClient.invalidateQueries({ queryKey: ['units'] });
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// Bulk Price Update Modal Component
interface BulkPriceModalProps {
  count: number;
  onClose: () => void;
  onConfirm: (price: string) => void;
  isLoading: boolean;
}

const BulkPriceModal: React.FC<BulkPriceModalProps> = ({ count, onClose, onConfirm, isLoading }) => {
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bulk Price Update</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <p className="modal-description">
            Update price for <strong>{count}</strong> selected unit{count !== 1 ? 's' : ''}
          </p>
          <div className="form-group">
            <label htmlFor="bulk_price">New Price (KES) <span className="required">*</span></label>
            <input
              id="bulk_price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter new price"
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Status Update Modal Component
interface BulkStatusModalProps {
  count: number;
  onClose: () => void;
  onConfirm: (status: string) => void;
  isLoading: boolean;
}

const BulkStatusModal: React.FC<BulkStatusModalProps> = ({ count, onClose, onConfirm, isLoading }) => {
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      alert('Please select a status');
      return;
    }
    if (window.confirm(`Change status for ${count} unit(s) to ${status}?`)) {
      onConfirm(status);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bulk Status Update</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <p className="modal-description">
            Update status for <strong>{count}</strong> selected unit{count !== 1 ? 's' : ''}
          </p>
          <div className="form-group">
            <label htmlFor="bulk_status">New Status <span className="required">*</span></label>
            <select
              id="bulk_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">-- Select Status --</option>
              <option value="AV">Available</option>
              <option value="RS">Reserved</option>
              <option value="RT">Returned</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// CSV Import Modal Component
interface CSVImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onSuccess, showToast }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/units/import_csv/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        showToast(`Successfully imported ${data.created} unit(s)`, 'success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setResult(data);
        showToast(`Import failed: ${data.error}`, 'error');
      }
    } catch (error: any) {
      showToast(`Upload error: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Units from CSV</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <p className="modal-description">
            Upload a CSV file to bulk import inventory units. Required columns: Product, Selling Price.
          </p>
          <div className="form-group">
            <label htmlFor="csv_file">CSV File <span className="required">*</span></label>
            <input
              id="csv_file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
              disabled={isUploading}
            />
            {file && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>Selected: {file.name}</p>}
          </div>

          {result && (
            <div className={`result-box ${result.success ? 'success' : 'error'}`}>
              <h4>Import Results</h4>
              <p>Created: {result.created || 0} | Failed: {result.failed || 0}</p>
              {result.errors && result.errors.length > 0 && (
                <details>
                  <summary>View Errors ({result.errors.length})</summary>
                  <ul>
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isUploading}>
              {result && result.success ? 'Close' : 'Cancel'}
            </button>
            {(!result || !result.success) && (
              <button type="submit" className="btn-primary" disabled={isUploading || !file}>
                {isUploading ? 'Importing...' : 'Import Units'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

