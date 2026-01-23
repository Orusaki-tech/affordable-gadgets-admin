import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrdersService, type OrderResponse, OpenAPI } from '../api/index';

interface OrderDetailsModalProps {
  orderId: string;
  isSalesperson?: boolean;
  onConfirmCash?: (orderId: string) => void;
  onInitiatePayment?: (orderId: string) => void;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  isSalesperson = false,
  onConfirmCash,
  onInitiatePayment,
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

  const downloadReceipt = () => {
    if (!orderId) return;
    
    // Get base URL from OpenAPI config
    let baseUrl = OpenAPI.BASE || '';
    
    // If baseUrl is relative (starts with /), we need to construct the full URL
    if (baseUrl.startsWith('/')) {
      // Get the current origin (protocol + hostname + port)
      const origin = window.location.origin;
      // Remove leading slash from baseUrl and construct full URL
      baseUrl = `${origin}${baseUrl}`;
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // Construct the receipt URL properly
    // The base URL should already include /api/inventory, so we just need to add the path
    // Ensure we don't have double slashes
    const receiptPath = `/orders/${orderId}/receipt/?format=pdf`;
    const receiptUrl = `${baseUrl}${receiptPath}`;
    
    // Open in new tab to download
    window.open(receiptUrl, '_blank');
  };

  // Check if order is paid (receipts are only available for paid orders)
  const isPaid = data?.status?.toLowerCase().includes('paid') || 
                 data?.status_display?.toLowerCase().includes('paid');
  const isPending = data?.status?.toLowerCase().includes('pending') || 
                    data?.status_display?.toLowerCase().includes('pending');
  const customerEmail = (data as any)?.customer_email || '';
  const isWalkIn = data?.order_source === 'WALK_IN';
  const canShowPaymentActions = isSalesperson && isPending && isWalkIn;

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
                {customerEmail && (
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{customerEmail}</span>
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
                {(() => {
                  const bundleGroups = new Map<string, { title: string; total: number; items: any[] }>();
                  (data.order_items || []).forEach((item: any) => {
                    if (!item.bundle_group_id) return;
                    const key = String(item.bundle_group_id);
                    if (!bundleGroups.has(key)) {
                      bundleGroups.set(key, {
                        title: item.bundle_title || 'Bundle',
                        total: 0,
                        items: [],
                      });
                    }
                    const unitPrice = Number(item.unit_price_at_purchase ?? 0);
                    const quantity = Number(item.quantity ?? 0);
                    const lineTotal = Number(item.sub_total ?? (unitPrice * quantity));
                    const group = bundleGroups.get(key)!;
                    group.items.push(item);
                    group.total += lineTotal;
                  });
                  const bundleList = Array.from(bundleGroups.values());
                  if (bundleList.length === 0) return null;
                  return (
                    <div className="bundle-summary-card" style={{ marginBottom: '16px' }}>
                      <div className="bundle-summary-title">Bundle Summary</div>
                      {bundleList.map((bundle, idx) => (
                        <div key={`${bundle.title}-${idx}`} className="bundle-summary-item">
                          <div className="bundle-summary-header">
                            <span className="bundle-summary-name">{bundle.title}</span>
                            <span className="bundle-summary-total">KES {bundle.total.toFixed(2)}</span>
                          </div>
                          <ul className="bundle-summary-list">
                            {bundle.items.map((item, itemIdx) => (
                              <li key={item.id || itemIdx}>
                                {item.product_template_name || 'Item'} × {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
                      {(() => {
                        const bundleGroups = new Map<string, { title: string; total: number; items: any[] }>();
                        const standaloneItems: any[] = [];
                        (data.order_items || []).forEach((item: any) => {
                          if (item.bundle_group_id) {
                            const key = String(item.bundle_group_id);
                            if (!bundleGroups.has(key)) {
                              bundleGroups.set(key, {
                                title: item.bundle_title || 'Bundle',
                                total: 0,
                                items: [],
                              });
                            }
                            const unitPrice = Number(item.unit_price_at_purchase ?? 0);
                            const quantity = Number(item.quantity ?? 0);
                            const lineTotal = Number(item.sub_total ?? (unitPrice * quantity));
                            const group = bundleGroups.get(key)!;
                            group.items.push(item);
                            group.total += lineTotal;
                          } else {
                            standaloneItems.push(item);
                          }
                        });
                        const rows: React.ReactNode[] = [];

                        bundleGroups.forEach((bundle, key) => {
                          rows.push(
                            <tr key={`bundle-header-${key}`} className="bundle-group-row">
                              <td colSpan={5}>
                                <details className="bundle-group-details" open>
                                  <summary className="bundle-group-summary">
                                    <div className="bundle-group-title">{bundle.title}</div>
                                    <div className="bundle-group-total">KES {bundle.total.toFixed(2)}</div>
                                  </summary>
                                  <div className="bundle-group-items">
                                    <table className="order-items-table bundle-inner-table">
                                      <tbody>
                                        {bundle.items.map((item, index) => (
                                          <tr key={item.id || index}>
                                            <td>
                                              <div className="product-name">{item.product_template_name || 'N/A'}</div>
                                              <div className="bundle-tag">Bundle item</div>
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
                                    </table>
                                  </div>
                                </details>
                              </td>
                            </tr>
                          );
                        });

                        standaloneItems.forEach((item, index) => {
                          rows.push(
                            <tr key={item.id || `standalone-${index}`}>
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
                          );
                        });
                        return rows;
                      })()}
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

              {/* Payment Actions for walk-in pending orders */}
              {canShowPaymentActions && (
                <div className="order-actions-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color, #e0e0e0)' }}>
                  {onInitiatePayment && (
                    <button
                      onClick={() => {
                        if (window.confirm('Proceed to Pesapal checkout for this order?')) {
                          onInitiatePayment(orderId);
                        }
                      }}
                      className="btn-action btn-primary"
                      style={{ width: '100%', marginBottom: '0.75rem' }}
                    >
                      Proceed to Checkout (M-Pesa/Card)
                    </button>
                  )}
                  {onConfirmCash && (
                    <button
                      onClick={() => {
                        if (window.confirm('Confirm CASH payment for this order?')) {
                          onConfirmCash(orderId);
                        }
                      }}
                      className="btn-action btn-primary"
                      style={{ width: '100%' }}
                    >
                      Confirm Cash Payment
                    </button>
                  )}
                </div>
              )}

              {/* Receipt Download Button - Only show for paid orders */}
              {isPaid && (
                <div className="order-actions-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color, #e0e0e0)' }}>
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
                    Receipt is sent automatically to the customer email and WhatsApp (if configured).
                  </div>
                  <button
                    onClick={downloadReceipt}
                    className="btn-action btn-primary"
                    style={{ width: '100%' }}
                  >
                    <svg 
                      style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    Download Receipt
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

