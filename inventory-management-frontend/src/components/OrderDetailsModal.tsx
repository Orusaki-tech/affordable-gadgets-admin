import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrdersService, type OrderResponse } from '../api/index';

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  onClose,
}) => {
  const { data, isLoading, error } = useQuery<OrderResponse>({
    queryKey: ['order-details', orderId],
    queryFn: () => OrdersService.ordersRetrieve(orderId),
  });

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending') || statusLower.includes('processing')) return 'status-pending';
    if (statusLower.includes('paid')) return 'status-paid';
    if (statusLower.includes('delivered')) return 'status-delivered';
    if (statusLower.includes('completed') || statusLower.includes('fulfilled')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 'status-cancelled';
    return '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="order-details-content">
          {isLoading && <div className="loading">Loading order details...</div>}
          {error && (
            <div className="error">
              Error loading order details: {(error as Error).message}
            </div>
          )}
          {data && (
            <>
              <div className="order-info-section">
                <div className="info-row">
                  <label>Order ID:</label>
                  <span>{data.order_id || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Customer:</label>
                  <span>{data.customer_username || 'N/A'}</span>
                </div>
                {data.customer_phone && (
                  <div className="info-row">
                    <label>Phone Number:</label>
                    <span>{data.customer_phone}</span>
                  </div>
                )}
                {/* Delivery Address - Show prominently for online orders */}
                {data.order_source === 'ONLINE' && data.delivery_address && (
                  <div className="info-row delivery-address-row">
                    <label>Delivery Address:</label>
                    <span className="delivery-address">{data.delivery_address}</span>
                  </div>
                )}
                {/* Also show for walk-in if available */}
                {data.order_source === 'WALK_IN' && data.delivery_address && (
                  <div className="info-row">
                    <label>Address:</label>
                    <span>{data.delivery_address}</span>
                  </div>
                )}
                <div className="info-row">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusBadgeClass(data.status_display || data.status)}`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-14)',
                    fontWeight: 'var(--font-weight-semibold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {data.status_display || data.status || 'N/A'}
                  </span>
                </div>
                {data.order_source_display && (
                  <div className="info-row">
                    <label>Order Source:</label>
                    <span className="order-source-badge">
                      {data.order_source_display}
                    </span>
                  </div>
                )}
                {data.brand_name && (
                  <div className="info-row">
                    <label>Brand:</label>
                    <span>{data.brand_name}</span>
                  </div>
                )}
                {data.created_at && (() => {
                  const date = new Date(data.created_at);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const seconds = String(date.getSeconds()).padStart(2, '0');
                  return (
                    <div className="info-row">
                      <label>Order Date:</label>
                      <span className="info-value-datetime">
                        <div className="date-part">{`${day}/${month}/${year}`}</div>
                        <div className="time-part">{`${hours}:${minutes}:${seconds}`}</div>
                      </span>
                    </div>
                  );
                })()}
                <div className="info-row">
                  <label>Total Amount:</label>
                  <span className="total-amount">
                    {data.total_amount ? `KES ${Number(data.total_amount).toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                {data.order_items && data.order_items.length > 0 ? (
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Unit Details</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.order_items || []).map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            <div className="product-name">{item.product_template_name || 'N/A'}</div>
                          </td>
                          <td>
                            <div className="unit-details-compact">
                              {item.serial_number && (
                                <div className="unit-detail-row">
                                  <span className="unit-detail-label">Serial:</span>
                                  <span className="unit-detail-value">{item.serial_number}</span>
                                </div>
                              )}
                              {item.imei && (
                                <div className="unit-detail-row">
                                  <span className="unit-detail-label">IMEI:</span>
                                  <span className="unit-detail-value">{item.imei}</span>
                                </div>
                              )}
                              {item.unit_id && (
                                <div className="unit-detail-row">
                                  <span className="unit-detail-label">Unit ID:</span>
                                  <span className="unit-detail-value">{item.unit_id}</span>
                                </div>
                              )}
                              {!item.serial_number && !item.imei && !item.unit_id && (
                                <span className="no-unit-info">N/A</span>
                              )}
                            </div>
                          </td>
                          <td>{item.quantity || 0}</td>
                          <td>
                            {item.unit_price_at_purchase
                              ? `KES ${Number(item.unit_price_at_purchase).toFixed(2)}`
                              : 'N/A'}
                          </td>
                          <td>
                            {item.sub_total ? `KES ${Number(item.sub_total).toFixed(2)}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="total-label">Total:</td>
                        <td className="total-value">
                          {data.total_amount ? `KES ${Number(data.total_amount).toFixed(2)}` : 'N/A'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="no-items">No items in this order</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

