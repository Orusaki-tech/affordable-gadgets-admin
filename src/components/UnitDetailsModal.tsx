import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { UnitsService } from '../api/index';
import { UnitForm } from './UnitForm';

interface UnitDetailsModalProps {
  unitId: number;
  onClose: () => void;
  isEditable?: boolean;
}

export const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({ unitId, onClose, isEditable = false }) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnitDetailsModal.tsx:13',message:'UnitDetailsModal rendered',data:{unitId,isEditable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { data: unit, isLoading, error } = useQuery({
    queryKey: ['unit-details', unitId],
    queryFn: () => UnitsService.unitsRetrieve(unitId),
    enabled: !!unitId && !isEditing,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => UnitsService.unitsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['product', unit?.product_template] });
      alert('Inventory unit deleted successfully');
      onClose();
    },
    onError: (err: any) => {
      // Extract error message from DRF ValidationError response
      let errorMessage = 'Unknown error';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data) && data.length > 0) {
          errorMessage = typeof data[0] === 'string' ? data[0] : JSON.stringify(data[0]);
        } else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstValue = data[keys[0]];
            if (Array.isArray(firstValue) && firstValue.length > 0) {
              errorMessage = firstValue[0];
            } else if (typeof firstValue === 'string') {
              errorMessage = firstValue;
            } else {
              errorMessage = JSON.stringify(data);
            }
          } else {
            errorMessage = JSON.stringify(data);
          }
        }
      } else if (err?.message && err.message !== 'Bad Request' && err.message !== 'Request failed with status code 400') {
        errorMessage = err.message;
      } else if (err?.response?.statusText && err.response.statusText !== 'Bad Request') {
        errorMessage = err.response.statusText;
      }
      alert(`Failed to delete inventory unit: ${errorMessage}`);
    },
  });

  const handleDelete = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnitDetailsModal.tsx:75',message:'handleDelete called',data:{unitId,unitName:unit?.serial_number||unit?.product_template_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!unitId) return;
    const unitName = unit?.serial_number || unit?.product_template_name || `Unit #${unitId}`;
    if (window.confirm(`Are you sure you want to delete "${unitName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(unitId);
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Unit Details</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{ 
              color: 'var(--md-on-surface-variant)', 
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-16)'
            }}>
              Loading unit details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Unit Details</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body" style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ 
              color: 'var(--md-error)', 
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-16)',
              backgroundColor: 'var(--md-error-container)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--md-error)'
            }}>
              Error loading unit details: {(error as any)?.message || 'Unit not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatStatus = (status?: string) => {
    const statusMap: { [key: string]: { label: string; color: string; bgColor: string } } = {
      'AV': { label: 'Available', color: '#155724', bgColor: '#d4edda' },
      'SD': { label: 'Sold', color: '#856404', bgColor: '#fff3cd' },
      'RT': { label: 'Returned', color: '#721c24', bgColor: '#f8d7da' },
      'RS': { label: 'Reserved', color: '#383d41', bgColor: '#e2e3e5' },
      'PP': { label: 'Pending Payment', color: '#084298', bgColor: '#cfe2ff' },
    };
    const statusInfo = statusMap[status || ''] || { label: status || 'N/A', color: '#666', bgColor: '#f0f0f0' };
    return statusInfo;
  };

  const formatCondition = (condition?: string) => {
    const conditionMap: { [key: string]: string } = {
      'N': 'New',
      'R': 'Refurbished',
      'P': 'Pre-owned',
      'D': 'Defective',
    };
    return conditionMap[condition || ''] || condition || 'N/A';
  };

  const formatSource = (source?: string) => {
    const sourceMap: { [key: string]: string } = {
      'SU': 'Supplier',
      'IM': 'Import',
      'BB': 'Buyback',
    };
    return sourceMap[source || ''] || source || 'N/A';
  };

  const statusInfo = formatStatus(unit.sale_status);

  // If editing and unit is loaded, show UnitForm
  if (isEditing && unit && isEditable) {
    return (
      <UnitForm
        unit={unit}
        onClose={() => {
          setIsEditing(false);
          // Refetch unit details after closing edit
          queryClient.invalidateQueries({ queryKey: ['unit-details', unitId] });
          queryClient.invalidateQueries({ queryKey: ['units'] });
        }}
        onSuccess={() => {
          setIsEditing(false);
          // Refetch unit details after successful edit
          queryClient.invalidateQueries({ queryKey: ['unit-details', unitId] });
          queryClient.invalidateQueries({ queryKey: ['units'] });
        }}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inventory Unit Details</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* #region agent log */}
            {(() => {
              fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnitDetailsModal.tsx:138',message:'Checking isEditable for button visibility',data:{isEditable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              return null;
            })()}
            {/* #endregion */}
            {isEditable && (
              <>
                {/* #region agent log */}
                {(() => {
                  if (typeof window !== 'undefined') {
                    fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnitDetailsModal.tsx:206',message:'Rendering buttons - isEditable is true',data:{isEditable,hasDeleteMutation:!!deleteMutation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                  }
                  return null;
                })()}
                {/* #endregion */}
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-14)',
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={deleteMutation.isPending}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-14)',
                    backgroundColor: 'var(--md-error)',
                    color: 'var(--md-on-error)',
                  }}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="unit-details-grid">
            {/* Basic Information */}
            <div className="details-section">
              <h3>Basic Information</h3>
              <div className="details-row">
                <span className="detail-label">Unit ID:</span>
                <span className="detail-value">{unit.id || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Product:</span>
                <span className="detail-value">{unit.product_template_name || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Brand:</span>
                <span className="detail-value">{unit.product_brand || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Product Type:</span>
                <span className="detail-value">{unit.product_type || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Quantity:</span>
                <span className="detail-value">{unit.quantity || 1}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="details-section">
              <h3>Pricing</h3>
              <div className="details-row">
                <span className="detail-label">Selling Price:</span>
                <span className="detail-value">
                  {unit.selling_price ? `KES ${Number(unit.selling_price).toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className="details-row">
                <span className="detail-label">Cost of Unit:</span>
                <span className="detail-value">
                  {unit.cost_of_unit ? `KES ${Number(unit.cost_of_unit).toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Status & Condition */}
            <div className="details-section">
              <h3>Status & Condition</h3>
              <div className="details-row">
                <span className="detail-label">Sale Status:</span>
                <span className="detail-value">
                  <span style={{
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-12)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: statusInfo.bgColor,
                    color: statusInfo.color,
                    border: `1px solid ${statusInfo.color}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {statusInfo.label} ({unit.sale_status || 'N/A'})
                  </span>
                </span>
              </div>
              <div className="details-row">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">{formatCondition(unit.condition)}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Grade:</span>
                <span className="detail-value">{unit.grade ? String(unit.grade) : 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Source:</span>
                <span className="detail-value">{formatSource(unit.source)}</span>
              </div>
              <div className="details-row">
                <span className="detail-label">Date Sourced:</span>
                <span className="detail-value">{formatDate(unit.date_sourced || undefined)}</span>
              </div>
            </div>

            {/* Identifiers */}
            {(unit.serial_number || unit.imei) && (
              <div className="details-section">
                <h3>Identifiers</h3>
                {unit.serial_number && (
                  <div className="details-row">
                    <span className="detail-label">Serial Number:</span>
                    <span className="detail-value">{unit.serial_number}</span>
                  </div>
                )}
                {unit.imei && (
                  <div className="details-row">
                    <span className="detail-label">IMEI:</span>
                    <span className="detail-value">{unit.imei}</span>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {(unit.storage_gb || unit.ram_gb || unit.processor_details || unit.is_sim_enabled !== undefined) && (
              <div className="details-section">
                <h3>Specifications</h3>
                {unit.storage_gb && (
                  <div className="details-row">
                    <span className="detail-label">Storage:</span>
                    <span className="detail-value">{unit.storage_gb} GB</span>
                  </div>
                )}
                {unit.ram_gb && (
                  <div className="details-row">
                    <span className="detail-label">RAM:</span>
                    <span className="detail-value">{unit.ram_gb} GB</span>
                  </div>
                )}
                {unit.processor_details && (
                  <div className="details-row">
                    <span className="detail-label">Processor:</span>
                    <span className="detail-value">{unit.processor_details}</span>
                  </div>
                )}
                {unit.is_sim_enabled !== undefined && (
                  <div className="details-row">
                    <span className="detail-label">SIM Enabled:</span>
                    <span className="detail-value">{unit.is_sim_enabled ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="details-section">
              <h3>Additional Information</h3>
              {unit.product_color && (
                <div className="details-row">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">
                    <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      backgroundColor: unit.product_color.hex_code || '#000',
                      border: '2px solid var(--md-outline-variant)',
                      borderRadius: 'var(--radius-md)',
                      marginRight: 'var(--spacing-sm)',
                      verticalAlign: 'middle',
                      boxShadow: 'var(--shadow-sm)',
                    }} />
                    {unit.product_color.name || 'N/A'}
                  </span>
                </div>
              )}
              {unit.acquisition_source_details && (
                <div className="details-row">
                  <span className="detail-label">Acquisition Source:</span>
                  <span className="detail-value">
                    {unit.acquisition_source_details.name || 'N/A'}
                    {unit.acquisition_source_details.phone_number && (
                      <span style={{ 
                        marginLeft: 'var(--spacing-sm)', 
                        color: 'var(--md-on-surface-variant)', 
                        fontSize: 'var(--font-size-12)' 
                      }}>
                        ({unit.acquisition_source_details.phone_number})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Images */}
            {unit.images && unit.images.length > 0 && (
              <div className="details-section" style={{ gridColumn: '1 / -1' }}>
                <h3>Images</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: 'var(--spacing-md)', 
                  marginTop: 'var(--spacing-md)' 
                }}>
                  {(() => {
                    // images is typed as string but actually returns an array from the API
                    const imagesArray = typeof unit.images === 'string' ? (unit.images ? JSON.parse(unit.images) : []) : (unit.images as any);
                    return Array.isArray(imagesArray) ? imagesArray.map((img: any) => {
                    const imageUrl = img.image_url || img.image;
                    const fullImageUrl = imageUrl 
                      ? (imageUrl.startsWith('http') || imageUrl.startsWith('//') 
                          ? imageUrl 
                          : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
                      : null;
                    
                    return (
                      <div key={img.id} style={{ position: 'relative' }}>
                        <img
                          src={fullImageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                          alt="Unit"
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--md-outline-variant)',
                            backgroundColor: 'var(--md-surface-variant)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'transform var(--transition-base)',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          }}
                        />
                        {img.is_primary && (
                          <div style={{
                            position: 'absolute',
                            top: 'var(--spacing-xs)',
                            right: 'var(--spacing-xs)',
                            backgroundColor: 'var(--md-tertiary-container)',
                            color: 'var(--md-on-tertiary-container)',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-11)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 'var(--font-weight-semibold)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            border: '1px solid var(--md-tertiary)',
                            boxShadow: 'var(--shadow-sm)',
                          }}>
                            Primary
                          </div>
                        )}
                      </div>
                    );
                  }) : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

