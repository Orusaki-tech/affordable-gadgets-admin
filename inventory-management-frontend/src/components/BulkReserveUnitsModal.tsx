import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryUnitRW } from '../api/index';

interface BulkReserveUnitsModalProps {
  productId: number;
  availableUnits: InventoryUnitRW[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkReserveUnitsModal: React.FC<BulkReserveUnitsModalProps> = ({
  productId,
  availableUnits,
  onClose,
  onSuccess,
}) => {
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(new Set());
  const [reserveQuantity, setReserveQuantity] = useState<number>(0);
  const [selectedUnitQuantities, setSelectedUnitQuantities] = useState<Map<number, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Filter available units (only AVAILABLE status)
  const availableOnly = useMemo(() => {
    return availableUnits.filter(unit => unit.sale_status === 'AV' && unit.id !== undefined);
  }, [availableUnits]);

  // Filter units by search term
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return availableOnly;
    const searchLower = searchTerm.toLowerCase();
    return availableOnly.filter(unit => {
      const serial = (unit.serial_number || '').toLowerCase();
      const imei = (unit.imei || '').toLowerCase();
      const productName = (unit.product_template_name || '').toLowerCase();
      const condition = (unit.condition || '').toLowerCase();
      const grade = unit.grade ? String(unit.grade).toLowerCase() : '';
      return serial.includes(searchLower) ||
             imei.includes(searchLower) ||
             productName.includes(searchLower) ||
             condition.includes(searchLower) ||
             grade.includes(searchLower);
    });
  }, [availableOnly, searchTerm]);

  const isAccessoryProduct = useMemo(() => {
    return availableUnits.some(unit => unit.product_type === 'AC');
  }, [availableUnits]);

  const selectedCount = useMemo(() => {
    if (isAccessoryProduct) {
      return Array.from(selectedUnitQuantities.values()).reduce((sum, qty) => sum + qty, 0);
    }
    return selectedUnitIds.size;
  }, [isAccessoryProduct, selectedUnitIds.size, selectedUnitQuantities]);

  const toggleUnitSelection = (unitId: number) => {
    if (isAccessoryProduct) {
      const currentQty = selectedUnitQuantities.get(unitId) || 0;
      const unit = filteredUnits.find(u => u.id === unitId);
      const maxQty = unit?.quantity ?? 1;
      const nextQty = currentQty > 0 ? 0 : 1;
      const newSelected = new Map(selectedUnitQuantities);
      if (nextQty === 0) {
        newSelected.delete(unitId);
      } else {
        newSelected.set(unitId, Math.min(nextQty, maxQty));
      }
      setSelectedUnitQuantities(newSelected);
      return;
    }
    const newSelected = new Set(selectedUnitIds);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnitIds(newSelected);
    setReserveQuantity(newSelected.size);
  };

  const selectAll = () => {
    if (isAccessoryProduct) {
      const newSelected = new Map<number, number>();
      filteredUnits.forEach(unit => {
        if (unit.id !== undefined) {
          const maxQty = unit.quantity ?? 1;
          if (maxQty > 0) {
            newSelected.set(unit.id, maxQty);
          }
        }
      });
      setSelectedUnitQuantities(newSelected);
      return;
    }
    const allIds = filteredUnits.map(u => u.id).filter((id): id is number => id !== undefined);
    setSelectedUnitIds(new Set(allIds));
    setReserveQuantity(allIds.length);
  };

  const deselectAll = () => {
    setSelectedUnitIds(new Set());
    setReserveQuantity(0);
    setSelectedUnitQuantities(new Map());
  };

  const applyQuantitySelection = () => {
    if (isAccessoryProduct) {
      return;
    }
    const selectableIds = filteredUnits.map(u => u.id).filter((id): id is number => id !== undefined);
    if (selectableIds.length === 0) {
      alert('No available units to reserve.');
      return;
    }
    const clampedQuantity = Math.max(0, Math.min(reserveQuantity, selectableIds.length));
    if (clampedQuantity !== reserveQuantity) {
      setReserveQuantity(clampedQuantity);
    }
    setSelectedUnitIds(new Set(selectableIds.slice(0, clampedQuantity)));
  };

  const bulkReserveMutation = useMutation({
    mutationFn: ({ unitIds, unitQuantities }: { unitIds: number[]; unitQuantities?: Record<number, number> }) => {
      // Use the existing API but with inventory_unit_ids array
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      return fetch(`${baseUrl}/reservation-requests/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory_unit_ids: unitIds,
          inventory_unit_quantities: unitQuantities,
          notes: notes.trim() || undefined,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
        }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      alert(`Successfully created reservation request for ${selectedCount} unit(s)`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to create reservation request.';
      alert(`Error: ${errorMessage}`);
    },
  });

  const handleReserve = () => {
    if (selectedCount === 0) {
      alert('Please select at least one unit to reserve.');
      return;
    }

    if (isAccessoryProduct) {
      const entries = Array.from(selectedUnitQuantities.entries()).filter(([, qty]) => qty > 0);
      const unitIds = entries.map(([id]) => id);
      const unitQuantities = entries.reduce((acc, [id, qty]) => {
        acc[id] = qty;
        return acc;
      }, {} as Record<number, number>);
      if (window.confirm(`Create reservation request for ${selectedCount} unit(s)?`)) {
        bulkReserveMutation.mutate({ unitIds, unitQuantities });
      }
      return;
    }

    const unitIds = Array.from(selectedUnitIds);
    const unitQuantities = unitIds.reduce((acc, id) => {
      acc[id] = 1;
      return acc;
    }, {} as Record<number, number>);
    if (window.confirm(`Create reservation request for ${selectedCount} unit(s)?`)) {
      bulkReserveMutation.mutate({ unitIds, unitQuantities });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reserve Units</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Search Units</label>
            <input
              type="text"
              placeholder="Search by serial, IMEI, condition, grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="selection-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={selectAll} className="btn-link">Select All</button>
              <span>|</span>
              <button type="button" onClick={deselectAll} className="btn-link">Deselect All</button>
              <span className="selected-count" style={{ marginLeft: 'auto', fontWeight: 'var(--font-weight-semibold)' }}>
                {selectedCount} selected
              </span>
            </div>
            {!isAccessoryProduct && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <label htmlFor="reserve-quantity" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Quantity
                </label>
                <input
                  id="reserve-quantity"
                  type="number"
                  min={0}
                  max={filteredUnits.length}
                  value={reserveQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setReserveQuantity(Number.isNaN(value) ? 0 : value);
                  }}
                  style={{ width: '90px' }}
                />
                <button
                  type="button"
                  className="btn-link"
                  onClick={applyQuantitySelection}
                  disabled={filteredUnits.length === 0}
                >
                  Select Quantity
                </button>
                <span style={{ color: '#666', fontSize: '0.85rem' }}>
                  Max {filteredUnits.length}
                </span>
              </div>
            )}
          </div>

          <div className="units-list">
            {filteredUnits.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? 'No units match your search.' : 'No available units to reserve.'}
              </div>
            ) : (
              filteredUnits.map((unit) => {
                const isSelected = unit.id !== undefined && (isAccessoryProduct ? (selectedUnitQuantities.get(unit.id) || 0) > 0 : selectedUnitIds.has(unit.id));
                const selectedQty = unit.id !== undefined ? (selectedUnitQuantities.get(unit.id) || 0) : 0;
                const maxQty = unit.quantity ?? 1;
                return (
                  <div
                    key={unit.id}
                    className={`unit-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => unit.id && toggleUnitSelection(unit.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => unit.id && toggleUnitSelection(unit.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="unit-select-info">
                      <div className="unit-select-name">
                        {unit.product_template_name || `Unit #${unit.id}`}
                      </div>
                      <div className="unit-select-details">
                        {unit.serial_number && <span>Serial: {unit.serial_number}</span>}
                        {unit.imei && <span>IMEI: {unit.imei}</span>}
                        {unit.condition && <span>Condition: {unit.condition}</span>}
                        {unit.grade && <span>Grade: {String(unit.grade)}</span>}
                        {unit.color_name && <span>Color: {unit.color_name}</span>}
                        {unit.quantity !== undefined && <span>Available: {unit.quantity}</span>}
                        {unit.selling_price && (
                          <span className="unit-price">
                            KES {Number(unit.selling_price).toFixed(0)}
                          </span>
                        )}
                      </div>
                      {isAccessoryProduct && unit.id !== undefined && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label htmlFor={`unit-qty-${unit.id}`} style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            Qty
                          </label>
                          <input
                            id={`unit-qty-${unit.id}`}
                            type="number"
                            min={0}
                            max={maxQty}
                            value={selectedQty}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              const clamped = Math.max(0, Math.min(Number.isNaN(value) ? 0 : value, maxQty));
                              const next = new Map(selectedUnitQuantities);
                              if (clamped === 0) {
                                next.delete(unit.id as number);
                              } else {
                                next.set(unit.id as number, clamped);
                              }
                              setSelectedUnitQuantities(next);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '90px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this reservation request..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReserve}
              className="btn-primary"
              disabled={selectedCount === 0 || bulkReserveMutation.isPending}
            >
              {bulkReserveMutation.isPending ? 'Creating...' : `Reserve ${selectedCount} Unit(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

