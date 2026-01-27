import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const pendingPaymentKey = 'pending_payment_order_id';
  
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

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const hasPaymentParams = Boolean(
      searchParams.get('payment_return') || orderTrackingId || orderMerchantReference
    );
    const storedOrderId = sessionStorage.getItem(pendingPaymentKey);

    if (!hasPaymentParams && storedOrderId) {
      sessionStorage.removeItem(pendingPaymentKey);
      if (selectedOrderId === storedOrderId) {
        setSelectedOrderId(null);
      }
      return;
    }

    if (hasPaymentParams) {
      const orderIdToOpen = orderMerchantReference || orderIdParam || storedOrderId;
      if (orderIdToOpen && orderIdToOpen !== selectedOrderId) {
        setSelectedOrderId(orderIdToOpen);
      }
    } else if (orderIdParam && orderIdParam !== selectedOrderId) {
      setSelectedOrderId(orderIdParam);
    }
  }, [pendingPaymentKey, searchParams, selectedOrderId]);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const paymentReturn = searchParams.get('payment_return');
    const storedOrderId = sessionStorage.getItem(pendingPaymentKey);
    const orderIdToCheck = orderMerchantReference || orderIdParam || storedOrderId;
    if (!orderIdToCheck || !(paymentReturn || orderTrackingId || orderMerchantReference)) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let attempts = 0;
    const maxAttempts = 12;

    const updateOrderStatusInCache = (status: string, statusDisplay?: string) => {
      queryClient.setQueriesData(
        { queryKey: ['orders'], exact: false },
        (old: any) => {
          if (!old?.results) {
            return old;
          }
          return {
            ...old,
            results: old.results.map((order: any) => {
              if (order.order_id === orderIdToCheck) {
                return {
                  ...order,
                  status,
                  status_display: statusDisplay || status,
                };
              }
              return order;
            }),
          };
        }
      );
      queryClient.setQueryData(['order-details', orderIdToCheck], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status,
          status_display: statusDisplay || status,
        };
      });
    };

    const finishPolling = () => {
      sessionStorage.removeItem(pendingPaymentKey);
      if (searchParams.get('payment_return')) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('payment_return');
        setSearchParams(nextParams);
      }
    };

    const pollStatus = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const paymentStatus = await OrdersService.ordersPaymentStatusRetrieve(orderIdToCheck);
        const rawStatus = (paymentStatus?.status || paymentStatus?.status_display || '') as string;
        const normalizedStatus = rawStatus.toLowerCase();
        const statusDisplay = paymentStatus?.status_display || paymentStatus?.status || rawStatus;
        if (rawStatus) {
          let statusValue = rawStatus;
          if (normalizedStatus.includes('paid') || normalizedStatus.includes('completed')) {
            statusValue = OrderStatusEnum.PAID;
          } else if (normalizedStatus.includes('delivered')) {
            statusValue = OrderStatusEnum.DELIVERED;
          } else if (normalizedStatus.includes('canceled') || normalizedStatus.includes('cancelled')) {
            statusValue = OrderStatusEnum.CANCELED;
          } else if (normalizedStatus.includes('pending')) {
            statusValue = OrderStatusEnum.PENDING;
          }
          updateOrderStatusInCache(statusValue, statusDisplay);
        }
        if (normalizedStatus.includes('paid') || normalizedStatus.includes('completed') || normalizedStatus.includes('delivered')) {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['order-details', orderIdToCheck] });
          queryClient.invalidateQueries({ queryKey: ['reserved-units-for-order'] });
          queryClient.invalidateQueries({ queryKey: ['approved-reservation-requests-for-order'] });
          alert('Payment successful. Receipt will be sent automatically and is ready to download.');
          finishPolling();
          return;
        }
        if (normalizedStatus.includes('canceled') || normalizedStatus.includes('cancelled')) {
          alert(statusDisplay || 'Payment was canceled.');
          finishPolling();
          return;
        }
      } catch (error) {
        console.warn('Failed to check payment status:', error);
      }

      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(pollStatus, 5000);
      } else {
        finishPolling();
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pendingPaymentKey, queryClient, searchParams, setSearchParams]);

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
    mutationFn: (orderData: {
      order_items: Array<{ inventory_unit_id: number; quantity: number }>;
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
    }) => {
      return OrdersService.ordersCreate(orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['reserved-units-for-order'] });
      queryClient.invalidateQueries({ queryKey: ['approved-reservation-requests-for-order'] });
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
    mutationFn: async ({ orderId, paymentMethod }: { orderId: string; paymentMethod: 'CASH' }) => {
      const result = await OrdersService.ordersConfirmPaymentCreate(orderId, {
        order_items: [],
        payment_method: paymentMethod,
      } as any);
      return (result as any).message ? { message: (result as any).message } : { message: 'Payment confirmed successfully!' };
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['reserved-units-for-order'] });
      queryClient.invalidateQueries({ queryKey: ['approved-reservation-requests-for-order'] });
      alert(data.message || 'Payment confirmed successfully!');
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to confirm payment.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const callbackUrl =
        process.env.REACT_APP_PESAPAL_CALLBACK_URL ||
        `${window.location.origin}/orders?orderId=${orderId}&payment_return=1`;
      const result = await OrdersService.ordersInitiatePaymentCreate(orderId, {
        callback_url: callbackUrl,
      });
      return result;
    },
    onSuccess: (data: any, orderId: string) => {
      if (data?.redirect_url) {
        if (orderId) {
          sessionStorage.setItem(pendingPaymentKey, orderId);
        }
        window.location.href = data.redirect_url;
        return;
      }
      alert('Payment initiated, but no redirect URL was returned.');
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to initiate payment.';
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
                if (window.confirm('Confirm CASH payment for this order?')) {
                  confirmPaymentMutation.mutate({ orderId, paymentMethod: 'CASH' });
                }
              } : undefined}
              onInitiatePayment={isSalesperson && order.status === 'Pending' ? (orderId) => {
                if (window.confirm('Proceed to Pesapal checkout for this order?')) {
                  initiatePaymentMutation.mutate(orderId);
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
          isSalesperson={isSalesperson}
          onConfirmCash={(orderId) => confirmPaymentMutation.mutate({ orderId, paymentMethod: 'CASH' })}
          onInitiatePayment={(orderId) => initiatePaymentMutation.mutate(orderId)}
          onClose={() => {
            setSelectedOrderId(null);
            const nextParams = new URLSearchParams(searchParams);
            const keysToClear = [
              'orderId',
              'OrderTrackingId',
              'OrderMerchantReference',
              'payment_return',
            ];
            let changed = false;
            keysToClear.forEach((key) => {
              if (nextParams.has(key)) {
                nextParams.delete(key);
                changed = true;
              }
            });
            if (changed) {
              setSearchParams(nextParams, { replace: true });
            }
          }}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(orderData) => createOrderMutation.mutate(orderData)}
          isLoading={createOrderMutation.isPending}
          adminProfile={adminProfile}
          isSuperuser={isSuperuser}
          isSalesperson={isSalesperson}
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
  onInitiatePayment?: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
  isSalesperson?: boolean;
  isOrderManager?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusBadgeClass,
  onViewDetails,
  onConfirmPayment,
  onInitiatePayment,
  onMarkDelivered,
  isSalesperson = false,
  isOrderManager = false,
}) => {
  const statusClass = getStatusBadgeClass(order.status);
  const isWalkIn = order.order_source === 'WALK_IN';
  const isOnline = order.order_source === 'ONLINE';
  const canConfirmPayment = isSalesperson && order.status === 'Pending' && onConfirmPayment;
  const canInitiatePayment = isSalesperson && order.status === 'Pending' && onInitiatePayment && isWalkIn;
  const bundleGroups = Array.from(new Set((order.order_items || [])
    .map((item: any) => item.bundle_group_id)
    .filter(Boolean)));
  const bundleCount = bundleGroups.length;
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
        {bundleCount > 0 && (
          <div className="order-info-item">
            <span className="info-label">Bundles:</span>
            <span className="info-value">{bundleCount}</span>
          </div>
        )}
      </div>

      <div
        className="order-card-footer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <button
          className="btn-action btn-view"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order.order_id);
          }}
          style={{ width: '100%', maxWidth: '220px' }}
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
            style={{ width: '100%', maxWidth: '220px' }}
          >
            Confirm Cash
          </button>
        )}
        {canInitiatePayment && (
          <button
            className="btn-action btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onInitiatePayment(order.order_id);
            }}
            style={{ width: '100%', maxWidth: '220px' }}
          >
            Proceed to Checkout
          </button>
        )}
        {canMarkDelivered && (
          <button
            className="btn-action btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDelivered(order.order_id);
            }}
            style={{ width: '100%', maxWidth: '220px' }}
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
  onCreate: (data: {
    order_items: Array<{ inventory_unit_id: number; quantity: number }>;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
  }) => void;
  isLoading: boolean;
  adminProfile?: any;
  isSuperuser?: boolean;
  isSalesperson?: boolean;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onCreate, isLoading, adminProfile, isSuperuser, isSalesperson }) => {
  const [selectedUnits, setSelectedUnits] = useState<Array<{ inventory_unit_id: number; quantity: number }>>([]);
  const [reservedUnits, setReservedUnits] = useState<any[]>([]);
  const [approvedReservationUnits, setApprovedReservationUnits] = useState<Array<{ unitId: number; label: string; requestedQty: number }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Fetch reserved units with pagination support
  const { data: reservedUnitsData, isLoading: isLoadingReservedUnits, error: reservedUnitsError } = useQuery({
    queryKey: ['reserved-units-for-order'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const allUnits: any[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 100;

      while (hasMore) {
        const url = `${baseUrl}/units/?sale_status=RS&page=${page}&page_size=${pageSize}`;
        console.log('Fetching reserved units:', url);
        
        const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` },
      });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error fetching reserved units:', response.status, errorText);
          throw new Error(`Failed to fetch reserved units: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Page ${page}: Found ${data.results?.length || 0} reserved units`);
        if (data.results && data.results.length > 0) {
          console.log(`Sample unit from page ${page}:`, {
            id: data.results[0].id,
            sale_status: data.results[0].sale_status,
            reserved_by_id: data.results[0].reserved_by_id,
            reserved_by_username: data.results[0].reserved_by_username,
            product_name: data.results[0].product_template_name
          });
          allUnits.push(...data.results);
        } else {
          console.log(`Page ${page}: No units in results. Response:`, JSON.stringify(data).substring(0, 200));
        }

        // Check if there are more pages
        hasMore = data.next !== null && data.next !== undefined;
        page++;

        // Safety limit to prevent infinite loops
        if (page > 100) {
          console.warn('Reached pagination limit (100 pages)');
          break;
        }
      }

      console.log(`Total reserved units fetched: ${allUnits.length}`);
      return { results: allUnits, count: allUnits.length };
    },
    retry: 2,
  });

  // Fetch approved reservation requests to surface accessory reserved quantities
  const { data: approvedReservationsData, isLoading: isLoadingReservations, error: reservationsError } = useQuery({
    queryKey: ['approved-reservation-requests-for-order', adminProfile?.id, isSuperuser, isSalesperson],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const allRequests: any[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 100;

      while (hasMore) {
        const url = `${baseUrl}/reservation-requests/?page=${page}&page_size=${pageSize}`;
        const response = await fetch(url, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error fetching reservation requests:', response.status, errorText);
          throw new Error(`Failed to fetch reservation requests: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          allRequests.push(...data.results);
        }
        hasMore = data.next !== null && data.next !== undefined;
        page++;
        if (page > 100) {
          console.warn('Reached reservation requests pagination limit (100 pages)');
          break;
        }
      }

      return { results: allRequests, count: allRequests.length };
    },
    retry: 2,
  });

  useEffect(() => {
    if (reservedUnitsData?.results) {
      console.log('Setting reserved units:', reservedUnitsData.results.length);
      
      // Filter reserved units based on user role
      let filteredUnits = reservedUnitsData.results;
      
      // If user is a salesperson (not superuser), only show units reserved by them
      if (isSalesperson && !isSuperuser && adminProfile?.id) {
        const currentAdminId = adminProfile.id;
        console.log(`Filtering reserved units for salesperson. Current admin ID: ${currentAdminId}, Admin profile:`, adminProfile);
        console.log(`Sample unit before filtering:`, reservedUnitsData.results[0] ? {
          id: reservedUnitsData.results[0].id,
          reserved_by_id: reservedUnitsData.results[0].reserved_by_id,
          reserved_by: reservedUnitsData.results[0].reserved_by
        } : 'No units to check');
        
        filteredUnits = reservedUnitsData.results.filter((unit: any) => {
          const reservedById = unit.reserved_by_id || unit.reserved_by?.id;
          const matches = reservedById === currentAdminId;
          if (!matches && reservedUnitsData.results.length <= 5) {
            console.log(`Unit ${unit.id} excluded: reserved_by_id=${reservedById}, current_admin_id=${currentAdminId}`);
          }
          return matches;
        });
        console.log(`Filtered to ${filteredUnits.length} units reserved by current salesperson (ID: ${currentAdminId}) out of ${reservedUnitsData.results.length} total reserved units`);
      } else if (isSuperuser) {
        console.log('Superuser: showing all reserved units');
      } else {
        console.log('No admin profile or role info, showing all units');
      }
      
      setReservedUnits(filteredUnits);
    } else if (reservedUnitsData && !reservedUnitsData.results) {
      console.warn('No results in reservedUnitsData:', reservedUnitsData);
      setReservedUnits([]);
    }
  }, [reservedUnitsData, adminProfile, isSuperuser, isSalesperson]);

  useEffect(() => {
    if (!approvedReservationsData?.results) {
      setApprovedReservationUnits([]);
      return;
    }

    const approvedRequests = approvedReservationsData.results.filter((req: any) => req.status === 'AP');
    const scopedRequests = isSalesperson && !isSuperuser && adminProfile?.id
      ? approvedRequests.filter((req: any) => req.requesting_salesperson === adminProfile.id)
      : approvedRequests;

    const units: Array<{ unitId: number; label: string; requestedQty: number }> = [];

    for (const req of scopedRequests) {
      const unitQuantities = req.inventory_unit_quantities || {};
      if (req.inventory_units_details && req.inventory_units_details.length > 0) {
        for (const unit of req.inventory_units_details) {
          const unitId = unit.id;
          const requestedQty = unit.requested_quantity ?? unitQuantities[unitId] ?? unitQuantities[String(unitId)] ?? 1;
          const labelParts = [
            unit.product_name || unit.product_template_name || 'Unit',
            unit.serial_number ? `SN: ${unit.serial_number}` : `Unit #${unitId}`,
            requestedQty > 1 ? `Qty ${requestedQty}` : null,
          ].filter(Boolean);
          units.push({
            unitId,
            label: labelParts.join(' - '),
            requestedQty,
          });
        }
      } else if (req.inventory_unit) {
        const unitId = req.inventory_unit;
        const requestedQty = unitQuantities[unitId] ?? unitQuantities[String(unitId)] ?? 1;
        const label = `${req.inventory_unit_name || `Unit #${unitId}`}${requestedQty > 1 ? ` - Qty ${requestedQty}` : ''}`;
        units.push({ unitId, label, requestedQty });
      }
    }

    setApprovedReservationUnits(units);
  }, [approvedReservationsData, adminProfile, isSuperuser, isSalesperson]);

  // Log errors
  useEffect(() => {
    if (reservedUnitsError) {
      console.error('Error loading reserved units:', reservedUnitsError);
    }
  }, [reservedUnitsError]);

  const handleAddUnit = (unitId: number, quantity: number) => {
    if (selectedUnits.some((u) => u.inventory_unit_id === unitId)) {
      return;
    }
    setSelectedUnits([...selectedUnits, { inventory_unit_id: unitId, quantity: Math.max(1, quantity) }]);
  };

  const handleRemoveUnit = (index: number) => {
    setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedUnits];
    const unitId = updated[index].inventory_unit_id;
    const reservedQty = approvedReservationUnits.find((u) => u.unitId === unitId)?.requestedQty;
    const normalized = Math.max(1, quantity);
    updated[index].quantity = reservedQty ? Math.min(reservedQty, normalized) : normalized;
    setSelectedUnits(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnits.length === 0) {
      alert('Please select at least one unit');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Please enter a customer phone number');
      return;
    }
    onCreate({
      order_items: selectedUnits,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || undefined,
    });
  };

  const reservedUnitIdSet = useMemo(() => new Set(reservedUnits.map((unit) => unit.id)), [reservedUnits]);

  const reservationOptions = useMemo(
    () => approvedReservationUnits.filter((unit) => !reservedUnitIdSet.has(unit.unitId)),
    [approvedReservationUnits, reservedUnitIdSet]
  );

  const combinedError = reservedUnitsError || reservationsError;
  const isLoadingAllReserved = isLoadingReservedUnits || isLoadingReservations;

  const unitLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    reservedUnits.forEach((unit) => {
      map.set(
        unit.id,
        `${unit.product_template_name} - ${unit.serial_number || `Unit #${unit.id}`}`
      );
    });
    approvedReservationUnits.forEach((unit) => {
      if (!map.has(unit.unitId)) {
        map.set(unit.unitId, unit.label);
      }
    });
    return map;
  }, [reservedUnits, approvedReservationUnits]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label>Customer Name <span className="required">*</span></label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="form-group">
            <label>Customer Phone <span className="required">*</span></label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter customer phone"
              required
            />
          </div>
          <div className="form-group">
            <label>Customer Email (optional)</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
            />
          </div>
          <div className="form-group">
            <label>Select RESERVED Units <span className="required">*</span></label>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
              Only reserved units or approved reservation quantities can be ordered.
              {isSalesperson && !isSuperuser && (
                <span style={{ display: 'block', marginTop: '0.25rem', fontStyle: 'italic' }}>
                  Showing only units reserved by you.
                </span>
              )}
            </p>
            {isLoadingAllReserved && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                Loading reserved units...
              </p>
            )}
            {combinedError && (
              <p style={{ fontSize: '0.875rem', color: '#dc3545', marginBottom: '0.5rem' }}>
                Error loading reserved units: {combinedError instanceof Error ? combinedError.message : 'Unknown error'}
              </p>
            )}
            {!isLoadingAllReserved && !combinedError && reservedUnits.length === 0 && reservationOptions.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#856404', marginBottom: '0.5rem' }}>
                {isSalesperson && !isSuperuser
                  ? 'No reserved units or approved reservations found for you. Please reserve units first or wait for approval.'
                  : 'No reserved units or approved reservations found. Please reserve units first.'}
              </p>
            )}
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                const [kind, unitIdStr, qtyStr] = e.target.value.split(':');
                const unitId = Number(unitIdStr);
                if (kind === 'ru') {
                  handleAddUnit(unitId, 1);
                } else if (kind === 'rr') {
                  const qty = Number(qtyStr) || 1;
                  handleAddUnit(unitId, qty);
                }
                e.target.value = '';
              }}
              disabled={isLoading || isLoadingAllReserved}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
            >
              <option value="">-- Select a reserved unit --</option>
              {reservedUnits
                .filter((unit) => !selectedUnits.some((su) => su.inventory_unit_id === unit.id))
                .map((unit) => (
                  <option key={`ru-${unit.id}`} value={`ru:${unit.id}`}>
                    {unit.product_template_name} - {unit.serial_number || `Unit #${unit.id}`} 
                    {unit.reserved_by_username && ` (Reserved by: ${unit.reserved_by_username})`}
                  </option>
                ))}
              {reservationOptions
                .filter((unit) => !selectedUnits.some((su) => su.inventory_unit_id === unit.unitId))
                .map((unit) => (
                  <option key={`rr-${unit.unitId}`} value={`rr:${unit.unitId}:${unit.requestedQty}`}>
                    {unit.label}
                  </option>
                ))}
            </select>
            {!isLoadingAllReserved && (reservedUnits.length + reservationOptions.length) > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                Found {reservedUnits.length + reservationOptions.length} reserved unit{reservedUnits.length + reservationOptions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {selectedUnits.length > 0 && (
            <div className="form-group">
              <label>Selected Units:</label>
              <div style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '0.5rem' }}>
                {selectedUnits.map((item, index) => {
                  const unitLabel = unitLabelMap.get(item.inventory_unit_id);
                  const reservedQty = approvedReservationUnits.find((u) => u.unitId === item.inventory_unit_id)?.requestedQty;
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: index < selectedUnits.length - 1 ? '1px solid #eee' : 'none' }}>
                      <span>
                        {unitLabel || `Unit #${item.inventory_unit_id}`}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label>
                          Qty:
                          <input
                            type="number"
                            min="1"
                            max={reservedQty || undefined}
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
