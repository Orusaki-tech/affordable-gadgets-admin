import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadsService, type LeadAdmin } from '../api/index';

interface LeadDetailsModalProps {
  lead: LeadAdmin;
  onClose: () => void;
  onMarkContacted: (notes?: string) => void;
  onConvertToOrder: () => void;
  onReject: () => void;
  isSalesperson: boolean;
  isMyLead: boolean;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  onClose,
  onMarkContacted,
  onConvertToOrder,
  onReject,
  isSalesperson,
  isMyLead,
}) => {
  const [notes, setNotes] = useState(lead.salesperson_notes || '');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const queryClient = useQueryClient();
  const leadId = Number(lead.id);

  // Fetch full lead details to get items
  const { data: fullLead, isLoading } = useQuery({
    queryKey: ['lead-details', lead.id],
    queryFn: () => {
      if (!Number.isFinite(leadId)) {
        throw new Error('Lead id is missing');
      }
      return LeadsService.leadsRetrieve(leadId);
    },
    initialData: lead,
    enabled: Number.isFinite(leadId),
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      if (!Number.isFinite(leadId)) {
        throw new Error('Lead id is missing');
      }
      return LeadsService.leadsPartialUpdate(leadId, { salesperson_notes: newNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-details', lead.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowNotesInput(false);
    },
  });

  const formatDate = (dateString?: string | null) => {
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

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
      return 'KES 0.00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return 'KES 0.00';
    }
    return `KES ${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'NEW': return 'status-new';
      case 'CONTACTED': return 'status-contacted';
      case 'CONVERTED': return 'status-converted';
      case 'CLOSED': return 'status-closed';
      case 'EXPIRED': return 'status-expired';
      default: return 'status-unknown';
    }
  };

  const getUrgencyClass = (expiresAt?: string | null) => {
    if (!expiresAt) return 'urgency-none';
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 0) return 'urgency-expired';
    if (hoursUntilExpiry <= 24) return 'urgency-high';
    if (hoursUntilExpiry <= 48) return 'urgency-medium';
    if (hoursUntilExpiry <= 72) return 'urgency-low';
    return 'urgency-none';
  };

  const isUnclaimed = !lead.assigned_salesperson;
  const canClaim = isSalesperson && (isUnclaimed || !isMyLead);
  const canContact = isSalesperson && isMyLead && lead.status === 'NEW';
  const canConvert = isSalesperson && isMyLead && lead.status === 'CONTACTED';
  const canRelease = isSalesperson && isMyLead && lead.status === 'CONTACTED';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Lead Details</h2>
            <div className="lead-ref-badge">
              <span className="lead-ref">{fullLead?.lead_reference || lead.lead_reference}</span>
              <span className={`status-badge ${getStatusBadgeClass(fullLead?.status || lead.status)}`}>
                {fullLead?.status_display || lead.status_display || lead.status}
              </span>
              {fullLead?.expires_at && (
                <span className={`urgency-badge ${getUrgencyClass(fullLead.expires_at)}`}>
                  {formatDate(fullLead.expires_at)}
                </span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="lead-details-content">
          {isLoading && <div className="loading">Loading lead details...</div>}
          
          {fullLead && (
            <>
              {/* Customer Information */}
              <div className="info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{fullLead.customer_name_display || fullLead.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{fullLead.customer_phone}</span>
                  </div>
                  {fullLead.customer_email && (
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{fullLead.customer_email}</span>
                    </div>
                  )}
                  {fullLead.delivery_address && (
                    <div className="info-item">
                      <label>Delivery Address:</label>
                      <span>{fullLead.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Information */}
              <div className="info-section">
                <h3>Lead Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Submitted:</label>
                    <span>{formatDate(fullLead.submitted_at)}</span>
                  </div>
                  <div className="info-item">
                    <label>Assigned To:</label>
                    <span>{fullLead.assigned_salesperson_name || 'Unclaimed'}</span>
                  </div>
                  {fullLead.contacted_at && (
                    <div className="info-item">
                      <label>Contacted:</label>
                      <span>{formatDate(fullLead.contacted_at)}</span>
                    </div>
                  )}
                  {fullLead.converted_at && (
                    <div className="info-item">
                      <label>Converted:</label>
                      <span>{formatDate(fullLead.converted_at)}</span>
                    </div>
                  )}
                  {fullLead.brand_name && (
                    <div className="info-item">
                      <label>Brand:</label>
                      <span>{fullLead.brand_name}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Total Value:</label>
                    <span className="total-value">{formatCurrency(fullLead.total_value)}</span>
                  </div>
                </div>
              </div>

              {/* Lead Items */}
              {fullLead.items && fullLead.items.length > 0 && (
                <div className="info-section">
                  <h3>Items ({fullLead.items.length})</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullLead.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>
                            {item.product_name && (
                              <div className="item-product-name">{item.product_name}</div>
                            )}
                            <div className="item-unit-name">{item.product_name || `Unit ${item.inventory_unit}`}</div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price)}</td>
                            <td>{formatCurrency((typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : (item.unit_price || 0)) * (item.quantity || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="total-label">Total:</td>
                        <td className="total-amount">{formatCurrency(fullLead.total_value)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Notes Section */}
              <div className="info-section">
                <div className="notes-header">
                  <h3>Notes</h3>
                  {isMyLead && (
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setShowNotesInput(!showNotesInput)}
                    >
                      {showNotesInput ? 'Cancel' : 'Edit Notes'}
                    </button>
                  )}
                </div>
                {showNotesInput ? (
                  <div className="notes-input-section">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this lead..."
                      className="notes-textarea"
                      rows={4}
                    />
                    <div className="notes-actions">
                      <button
                        className="btn-primary"
                        onClick={() => updateNotesMutation.mutate(notes)}
                        disabled={updateNotesMutation.isPending}
                      >
                        {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setNotes(fullLead.salesperson_notes || '');
                          setShowNotesInput(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="notes-display">
                    {fullLead.salesperson_notes ? (
                      <p>{fullLead.salesperson_notes}</p>
                    ) : (
                      <p className="notes-empty">No notes added yet.</p>
                    )}
                  </div>
                )}
                {fullLead.customer_notes && (
                  <div className="customer-notes">
                    <label>Customer Notes:</label>
                    <p>{fullLead.customer_notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                {canClaim && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!Number.isFinite(leadId)) {
                        return;
                      }
                      LeadsService.leadsAssignCreate(leadId, {
                        customer_name: '',
                        customer_phone: '',
                        brand: 0,
                      } as any).then(() => {
                        queryClient.invalidateQueries({ queryKey: ['leads'] });
                        queryClient.invalidateQueries({ queryKey: ['lead-details', lead.id] });
                        onClose();
                      });
                    }}
                  >
                    {isUnclaimed ? 'Claim Lead' : 'Reclaim Lead'}
                  </button>
                )}
                {isMyLead && !isUnclaimed && (
                  <div className="claimed-indicator">
                    ✓ This lead is claimed by you
                  </div>
                )}
                {canContact && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const contactNotes = prompt('Add notes about the contact (optional):');
                      onMarkContacted(contactNotes || undefined);
                    }}
                  >
                    Mark as Contacted
                  </button>
                )}
                
                {/* Show both options when status is CONTACTED */}
                {(fullLead?.status === 'CONTACTED' || lead.status === 'CONTACTED') && isMyLead && (
                  <div className="contacted-actions-section">
                    <div className="contacted-actions-header">
                      <p className="contacted-actions-title">
                        After contacting the customer, what's the outcome?
                      </p>
                      <p className="contacted-actions-subtitle">
                        Choose one of the options below:
                      </p>
                    </div>
                    
                    {canConvert && (
                      <button
                        className="btn-primary btn-full-width"
                        onClick={() => {
                          if (window.confirm(
                            'Convert this lead to an order? This will mark the inventory units as SOLD and create an order.'
                          )) {
                            onConvertToOrder();
                          }
                        }}
                      >
                        ✅ Convert to Order (Customer wants to buy)
                      </button>
                    )}
                    
                    {canRelease && (
                      <button
                        className="btn-danger btn-full-width"
                        onClick={() => {
                          if (window.confirm(
                            'Release items back to stock? This will free up the inventory units and make them available for other customers. This action cannot be undone.'
                          )) {
                            onReject();
                          }
                        }}
                      >
                        🔄 Release Items to Stock (No sale)
                      </button>
                    )}
                  </div>
                )}
                
                <button className="btn-secondary" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

