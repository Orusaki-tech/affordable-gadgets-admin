import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService, OrdersService, OrderStatusEnum, type OrderResponse } from '../api/index';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  const { data, isLoading, error } = useQuery<{ results: OrderResponse[]; count: number; next?: string; previous?: string }>({
    queryKey: ['orders', page, pageSize],
    queryFn: () => OrdersService.ordersList(page) as Promise<{ results: OrderResponse[]; count: number; next?: string; previous?: string }>,
    enabled: !!user?.is_staff || !!user, // Enable for staff users or authenticated users
  });

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    if (!data?.results) return [];
    let filtered = data.results;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((order) => {
        const idMatch = order.order_id?.toString().toLowerCase().includes(searchLower);
        const customerMatch = order.customer_username?.toLowerCase().includes(searchLower);
        const statusMatch = order.status?.toLowerCase().includes(searchLower);
        return idMatch || customerMatch || statusMatch;
      });
    }
    
    return filtered;
  }, [data, statusFilter, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.results) {
      return { total: 0, pending: 0, paid: 0, delivered: 0, canceled: 0 };
    }
    const results = data.results;
    return {
      total: results.length,
      pending: results.filter((order) => order.status === 'Pending').length,
      paid: results.filter((order) => order.status === 'Paid').length,
      delivered: results.filter((order) => order.status === 'Delivered').length,
      canceled: results.filter((order) => order.status === 'Canceled').length,
    };
  }, [data]);

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending') || statusLower.includes('processing')) return 'status-pending';
    if (statusLower.includes('paid')) return 'status-paid';
    if (statusLower.includes('delivered')) return 'status-delivered';
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 'status-canceled';
    return '';
  };

  const createOrderMutation = useMutation({
    mutationFn: (orderData: { order_items: Array<{ inventory_unit_id: number; quantity: number }> }) => {
      return OrdersService.ordersCreate(orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Order created successfully!');
      setShowCreateModal(false);
    },
    onError: (err: any) => {
      const errorMessage = err?.body?.detail || err?.message || 'Failed to create order. Only RESERVED units can be included in an order.';
      alert(`Error: ${errorMessage}`);
    },
  });

  // Confirm payment mutation (for salespersons)
  const confirmPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Request body is optional per OpenAPI but type requires it - provide minimal valid request
      const result = await OrdersService.ordersConfirmPaymentCreate(orderId, {
        order_items: [],
      } as any);
      // Backend may return Order but we expect { message: string }, handle both
      return (result as any).message ? { message: (result as any).message } : { message: 'Payment confirmed successfully!' };
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert(data.message || 'Payment confirmed successfully!');
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to confirm payment.';
      alert(`Error: ${errorMessage}`);
    },
  });

  // Mark as delivered mutation (for Order Managers)
  const markDeliveredMutation = useMutation({
    mutationFn: (orderId: string) => {
      console.log('Marking order as delivered:', orderId);
      return OrdersService.ordersPartialUpdate(orderId, { status: OrderStatusEnum.DELIVERED });
    },
    onMutate: async (orderId) => {
      console.log('onMutate called for order:', orderId);
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: ['orders'] });
      
      // Optimistically update the cache using setQueriesData (like ReservationRequestsPage)
      queryClient.setQueriesData(
        { queryKey: ['orders'], exact: false },
        (old: any) => {
          if (!old?.results) {
            return old;
          }
          const updated = {
            ...old,
            results: old.results.map((order: any) => {
              if (order.order_id === orderId) {
                console.log('Optimistically updating order:', orderId, 'from', order.status, 'to Delivered');
                return {
                  ...order,
                  status: 'Delivered',
                  status_display: 'Delivered',
                };
              }
              return order;
            }),
          };
          console.log('Optimistic update complete:', updated);
          return updated;
        }
      );
      
      return { previousData };
    },
    onSuccess: (data, orderId) => {
      console.log('Mark delivered success:', { orderId, serverData: data });
      const extendedData = data as OrderResponse;
      
      // Update cache with server response (source of truth) using setQueriesData
      queryClient.setQueriesData(
        { queryKey: ['orders'], exact: false },
        (old: any) => {
          if (!old?.results) {
            return old;
          }
          const updated = {
            ...old,
            results: old.results.map((order: any) => {
              if (order.order_id === orderId) {
                // Merge server response with existing data
                const merged: OrderResponse = {
                  ...order,
                  ...extendedData, // Server response has the latest data
                  status: extendedData.status || 'Delivered',
                  status_display: extendedData.status_display || extendedData.status || 'Delivered',
                };
                console.log('Merged order data:', merged);
                return merged;
              }
              return order;
            }),
          };
          return updated;
        }
      );
      
      // Invalidate to trigger a refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any, orderId, context) => {
      console.error('Mark delivered error:', err);
      // Rollback optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to update order status.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setShowFilters(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (statusFilter !== 'all') count++;
    return count;
  }, [search, statusFilter]);

  // Role checks and redirect (after all hooks are declared)
  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isSalesperson = hasRole('SP') && !isSuperuser;
  const isOrderManager = hasRole('OM') && !isSuperuser;

  // Redirect Content Creators (they don't have access to orders)
  if (!isLoadingProfile && isContentCreator) {
    return <Navigate to="/content-creator/dashboard" replace />;
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when page size changes
  };

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error loading orders: {(error as Error).message}</div>;
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <div className="page-header-actions">
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Order
        </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="info-alert">
        <strong>Note:</strong> Only RESERVED units can be included in an order. Units must be reserved before they can be ordered.
      </div>

      {/* Summary Statistics Cards */}
      {data && (
        <div className="summary-stats">
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--total ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
            title={`Total Orders: ${stats.total}`}
            aria-pressed={statusFilter === 'all'}
          >
            <span className="summary-stat-label">Total</span>
            <span className="summary-stat-value">{(stats.total ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--pending ${statusFilter === 'Pending' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
            title={`Pending Orders: ${stats.pending}`}
            aria-pressed={statusFilter === 'Pending'}
          >
            <span className="summary-stat-label">Pending</span>
            <span className="summary-stat-value">{(stats.pending ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--paid ${statusFilter === 'Paid' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('Paid')}
            title={`Paid Orders: ${stats.paid}`}
            aria-pressed={statusFilter === 'Paid'}
          >
            <span className="summary-stat-label">Paid</span>
            <span className="summary-stat-value">{(stats.paid ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--delivered ${statusFilter === 'Delivered' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('Delivered')}
            title={`Delivered Orders: ${stats.delivered}`}
            aria-pressed={statusFilter === 'Delivered'}
          >
            <span className="summary-stat-label">Delivered</span>
            <span className="summary-stat-value">{(stats.delivered ?? 0).toLocaleString()}</span>
          </button>
          <button
            type="button"
            className={`summary-stat-button summary-stat-button--canceled ${statusFilter === 'Canceled' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('Canceled')}
            title={`Canceled Orders: ${stats.canceled}`}
            aria-pressed={statusFilter === 'Canceled'}
          >
            <span className="summary-stat-label">Canceled</span>
            <span className="summary-stat-value">{(stats.canceled ?? 0).toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by order ID, customer, or status..."
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
                  className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'Pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('Pending')}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'Paid' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('Paid')}
                >
                  Paid ({stats.paid})
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'Delivered' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('Delivered')}
                >
                  Delivered ({stats.delivered})
                </button>
                <button
                  className={`filter-chip ${statusFilter === 'Canceled' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('Canceled')}
                >
                  Canceled ({stats.canceled})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>
            {search || statusFilter !== 'all' 
              ? 'No matching orders found' 
              : 'No orders'}
          </h3>
          <p>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to see more orders.'
              : 'There are no orders in the system. Create one to get started.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              getStatusBadgeClass={getStatusBadgeClass}
              onViewDetails={(orderId) => orderId && setSelectedOrderId(orderId)}
              onConfirmPayment={isSalesperson && order.status === 'Pending' ? (orderId) => {
                if (window.confirm('Confirm payment for this order?')) {
                  confirmPaymentMutation.mutate(orderId);
                }
              } : undefined}
              onMarkDelivered={isOrderManager && order.status === 'Paid' && order.order_source === 'ONLINE' ? (orderId) => {
                if (window.confirm('Mark this order as delivered?')) {
                  markDeliveredMutation.mutate(orderId);
                }
              } : undefined}
              isSalesperson={isSalesperson}
              isOrderManager={isOrderManager}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.count && data.count > 0 ? (
      <div className="pagination">
          <div className="pagination-controls">
        <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={!data?.previous || page === 1}
          className="btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">
              Page {page} of {Math.ceil((data.count || 0) / pageSize)} ({data.count || 0} total)
        </span>
        <button
              onClick={() => setPage(p => p + 1)}
          disabled={!data?.next}
          className="btn-secondary"
        >
          Next
        </button>
      </div>
          <div className="page-size-selector">
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

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(orderData) => createOrderMutation.mutate(orderData)}
          isLoading={createOrderMutation.isPending}
        />
      )}
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: any;
  getStatusBadgeClass: (status?: string) => string;
  onViewDetails: (orderId: string | null) => void;
  onConfirmPayment?: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
  isSalesperson?: boolean;
  isOrderManager?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusBadgeClass,
  onViewDetails,
  onConfirmPayment,
  onMarkDelivered,
  isSalesperson = false,
  isOrderManager = false,
}) => {
  const statusClass = getStatusBadgeClass(order.status);
  const isWalkIn = order.order_source === 'WALK_IN';
  const isOnline = order.order_source === 'ONLINE';
  const canConfirmPayment = isSalesperson && order.status === 'Pending' && onConfirmPayment;
  // Order Managers can only mark ONLINE orders as delivered (not walk-in orders)
  const canMarkDelivered = isOrderManager && order.status === 'Paid' && (order as any).order_source === 'ONLINE' && onMarkDelivered;

  return (
    <div className={`order-card ${statusClass}`}>
      <div className="order-card-header">
        <div className="order-id">Order #{order.order_id || '-'}</div>
        <div className="order-header-badges">
          <span className={`status-badge ${statusClass}`}>
            {order.status_display || order.status || '-'}
          </span>
          {isWalkIn && (
            <span className="order-source-badge order-source-walkin">
              Walk-in
            </span>
          )}
          {isOnline && (
            <span className="order-source-badge order-source-online">
              Online
            </span>
          )}
        </div>
      </div>

      <div className="order-card-body">
        <div className="order-info-item">
          <span className="info-label">Customer:</span>
          <span className="info-value">{order.customer_username || '-'}</span>
        </div>

        <div className="order-info-item">
          <span className="info-label">Total Amount:</span>
          <span className="info-value" data-currency="true">
            {order.total_amount ? `KES ${Number(order.total_amount).toFixed(2)}` : '-'}
          </span>
        </div>

        <div className="order-info-item">
          <span className="info-label">Items:</span>
          <span className="info-value">{order.order_items?.length || 0}</span>
        </div>
      </div>

      <div className="order-card-footer">
        <button
          className="btn-action btn-view"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order.order_id);
          }}
        >
          View Details
        </button>
        {canConfirmPayment && (
          <button
            className="btn-action btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmPayment(order.order_id);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            Confirm Payment
          </button>
        )}
        {canMarkDelivered && (
          <button
            className="btn-action btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDelivered(order.order_id);
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
};

// Create Order Modal Component
interface CreateOrderModalProps {
  onClose: () => void;
  onCreate: (data: { order_items: Array<{ inventory_unit_id: number; quantity: number }> }) => void;
  isLoading: boolean;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onCreate, isLoading }) => {
  const [selectedUnits, setSelectedUnits] = useState<Array<{ inventory_unit_id: number; quantity: number }>>([]);
  const [reservedUnits, setReservedUnits] = useState<any[]>([]);

  // Fetch reserved units
  const { data: reservedUnitsData } = useQuery({
    queryKey: ['reserved-units-for-order'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/units/?sale_status=RS&page_size=100`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return { results: [] };
    },
  });

  useEffect(() => {
    if (reservedUnitsData?.results) {
      setReservedUnits(reservedUnitsData.results);
    }
  }, [reservedUnitsData]);

  const handleAddUnit = (unitId: number) => {
    const unit = reservedUnits.find((u) => u.id === unitId);
    if (!unit) return;
    
    const quantity = unit.product_type === 'AC' ? 1 : 1; // Accessories could have > 1, but default to 1
    setSelectedUnits([...selectedUnits, { inventory_unit_id: unitId, quantity }]);
  };

  const handleRemoveUnit = (index: number) => {
    setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedUnits];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedUnits(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit');
      return;
    }
    onCreate({ order_items: selectedUnits });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label>Select RESERVED Units <span className="required">*</span></label>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
              Only RESERVED units can be ordered. Units must be reserved first.
            </p>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddUnit(Number(e.target.value));
                  e.target.value = '';
                }
              }}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
            >
              <option value="">-- Select a reserved unit --</option>
              {reservedUnits
                .filter((unit) => !selectedUnits.some((su) => su.inventory_unit_id === unit.id))
                .map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.product_template_name} - {unit.serial_number || `Unit #${unit.id}`} 
                    {unit.reserved_by_username && ` (Reserved by: ${unit.reserved_by_username})`}
                  </option>
                ))}
            </select>
          </div>

          {selectedUnits.length > 0 && (
            <div className="form-group">
              <label>Selected Units:</label>
              <div style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '0.5rem' }}>
                {selectedUnits.map((item, index) => {
                  const unit = reservedUnits.find((u) => u.id === item.inventory_unit_id);
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: index < selectedUnits.length - 1 ? '1px solid #eee' : 'none' }}>
                      <span>
                        {unit?.product_template_name || `Unit #${item.inventory_unit_id}`}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label>
                          Qty:
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            style={{ width: '60px', marginLeft: '0.25rem', padding: '0.25rem' }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(index)}
                          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || selectedUnits.length === 0}>
              {isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
