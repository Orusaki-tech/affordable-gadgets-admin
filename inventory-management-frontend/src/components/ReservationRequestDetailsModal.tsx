import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReservationRequestsService, InventoryUnitRW, OrdersService, BrandsService, type ReservationRequest, type Brand, type OrderRequest } from '../api/index';

// Extended type for InventoryUnitRW with additional computed properties
type InventoryUnitRWExtended = InventoryUnitRW & {
  product_name?: string;
  sale_status_display?: string;
};

interface ReservationRequestDetailsModalProps {
  requestId: number;
  onClose: () => void;
  isSalesperson: boolean;
  isMyRequest: boolean;
  isInventoryManager?: boolean;
}

export const ReservationRequestDetailsModal: React.FC<ReservationRequestDetailsModalProps> = ({
  requestId,
  onClose,
  isSalesperson,
  isMyRequest,
  isInventoryManager = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(new Set());
  const [unitSearch, setUnitSearch] = useState('');
  const [showUnitSearch, setShowUnitSearch] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedUnitForOrder, setSelectedUnitForOrder] = useState<InventoryUnitRW | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Helper function to get sale status display
  const getSaleStatusDisplay = (status?: string): string => {
    const statusMap: Record<string, string> = {
      'AV': 'Available',
      'SD': 'Sold',
      'RS': 'Reserved',
      'RT': 'Returned',
      'PP': 'Pending Payment',
    };
    return status ? (statusMap[status] || status) : 'Available';
  };

  // Format date to DD/MM/YYYY, HH:MM:SS
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
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

  // Fetch request details
  const { data: request, isLoading, error } = useQuery<ReservationRequest>({
    queryKey: ['reservation-request', requestId],
    queryFn: () => ReservationRequestsService.reservationRequestsRetrieve(requestId) as Promise<ReservationRequest>,
    enabled: !!requestId,
  });

  // Determine if user can edit (must be defined before useQuery that uses it)
  // Only salespersons can edit their own PENDING requests
  // Inventory managers can view but not edit
  const canEdit = isSalesperson && isMyRequest && request?.status === 'PE' && !isInventoryManager;

  // Fetch available units for adding
  const { data: availableUnitsData, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['available-units-for-reservation', unitSearch],
    queryFn: async () => {
      // Fetch available units - filter by sale_status=AV (Available)
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const response = await fetch(`${baseUrl}/units/?sale_status=AV&page=1&page_size=100`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available units');
      }
      return await response.json();
    },
    enabled: showUnitSearch && canEdit,
  });

  // Initialize state when request loads
  React.useEffect(() => {
    if (request) {
      setNotes(request.notes || '');
      // Initialize selected units from request
      const unitIds = new Set<number>();
      // inventory_units_details is typed as string but actually returns an array from the API
      const unitsDetails = typeof request.inventory_units_details === 'string' 
        ? (request.inventory_units_details ? JSON.parse(request.inventory_units_details) : [])
        : (request.inventory_units_details as any);
      if (Array.isArray(unitsDetails) && unitsDetails.length > 0) {
        unitsDetails.forEach((unit: InventoryUnitRW) => {
          if (unit.id) unitIds.add(unit.id);
        });
      } else if (request.inventory_unit) {
        // Fallback to legacy single unit
        unitIds.add(request.inventory_unit);
      }
      setSelectedUnitIds(unitIds);
    }
  }, [request]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { inventory_unit_ids?: number[]; notes?: string }) => {
      return ReservationRequestsService.reservationRequestsPartialUpdate(requestId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      setIsEditing(false);
      onClose();
    },
    onError: (err: any) => {
      alert(`Failed to update request: ${err?.message || 'Unknown error'}`);
    },
  });

  // Get brand ID from reservation request
  const brandIdForOrder = useMemo(() => {
    if (!request) return null;
    
    // First, try to get brand from requesting salesperson's brands
    // requesting_salesperson_brands is typed as string but actually returns an array from the API
    const brands = typeof request.requesting_salesperson_brands === 'string'
      ? (request.requesting_salesperson_brands ? JSON.parse(request.requesting_salesperson_brands) : [])
      : (request.requesting_salesperson_brands as any);
    if (Array.isArray(brands) && brands.length > 0) {
      return brands[0]?.id || null;
    }
    
    return null;
  }, [request]);

  // Fetch brand details if we have a brand ID
  const { data: brandForOrder } = useQuery<Brand>({
    queryKey: ['brand', brandIdForOrder],
    queryFn: () => BrandsService.brandsRetrieve(brandIdForOrder!),
    enabled: !!brandIdForOrder,
  });

  // Check if brand is a website brand (has ecommerce_domain)
  const isWebsiteBrand = useMemo(() => {
    return brandForOrder?.ecommerce_domain && brandForOrder.ecommerce_domain.trim() !== '';
  }, [brandForOrder]);

  // Search for customer by phone (for website brands)
  const searchCustomerByPhone = useCallback(async (phone: string) => {
    if (!phone || !isWebsiteBrand) return;
    
    setIsSearchingCustomer(true);
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseUrl}/public/cart/recognize/?phone=${encodeURIComponent(phone)}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.customer && data.is_returning_customer) {
          // Auto-fill customer name if found
          setCustomerName(data.customer.name || '');
        }
      }
    } catch (error) {
      // Silently fail - don't show error for search
      console.log('Customer search failed:', error);
    } finally {
      setIsSearchingCustomer(false);
    }
  }, [isWebsiteBrand]);

  // Handle phone number change
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
  };

  // Debounced search for customer by phone (for website brands)
  React.useEffect(() => {
    if (!isWebsiteBrand || !customerPhone || customerPhone.length < 10) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      searchCustomerByPhone(customerPhone);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [customerPhone, isWebsiteBrand, searchCustomerByPhone]);

  // Create order from reserved unit mutation
  const createOrderMutation = useMutation({
    mutationFn: async ({
      unitId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      brandId,
    }: {
      unitId: number;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      deliveryAddress?: string;
      brandId: number;
    }) => {
      // Use the standard createOrder endpoint with a single reserved unit
      return OrdersService.ordersCreate({
        order_items: [{ inventory_unit_id: unitId, quantity: 1 }],
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        delivery_address: deliveryAddress || undefined,
        brand: brandId
      } as OrderRequest);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservation-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      alert(`Order created successfully! Order ID: ${data.order_id}`);
      setShowCreateOrderModal(false);
      setSelectedUnitForOrder(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDeliveryAddress('');
      onClose();
      navigate(`/orders?orderId=${data.order_id}`);
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create order';
      alert(`Error: ${errorMessage}`);
    },
  });

  const handleCreateOrder = (unit: InventoryUnitRW) => {
    // Check if unit is reserved
    if (unit.sale_status !== 'RS') {
      const statusDisplay = (unit as any).sale_status_display || unit.sale_status;
      alert(`Unit must be RESERVED to create order. Current status: ${statusDisplay}`);
      return;
    }
    setSelectedUnitForOrder(unit);
    setShowCreateOrderModal(true);
  };

  const handleSubmitOrder = () => {
    if (!selectedUnitForOrder) return;
    if (!customerName || !customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }
    if (!customerPhone || !customerPhone.trim()) {
      alert('Please enter a customer phone number');
      return;
    }
    if (!brandForOrder || !brandForOrder.id) {
      alert('Brand information is missing. Please contact support.');
      return;
    }
    if (!selectedUnitForOrder.id) {
      alert('Unit ID is missing. Please contact support.');
      return;
    }
    createOrderMutation.mutate({
      unitId: selectedUnitForOrder.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      deliveryAddress: deliveryAddress.trim(),
      brandId: brandForOrder.id,
    });
  };

  // Auto-enable editing if request is PENDING and owned by salesperson
  React.useEffect(() => {
    if (canEdit && !isEditing) {
      setIsEditing(true);
    }
  }, [canEdit, isEditing]);

  const handleSave = () => {
    if (selectedUnitIds.size === 0) {
      alert('Please select at least one inventory unit');
      return;
    }
    updateMutation.mutate({
      inventory_unit_ids: Array.from(selectedUnitIds),
      notes: notes,
    });
  };

  const handleRemoveUnit = (unitId: number) => {
    if (selectedUnitIds.size <= 1) {
      alert('At least one unit must remain in the request');
      return;
    }
    setSelectedUnitIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(unitId);
      return newSet;
    });
  };

  const handleAddUnit = (unit: InventoryUnitRW) => {
    setSelectedUnitIds(prev => new Set(prev).add(unit.id!));
    setUnitSearch('');
    setShowUnitSearch(false);
  };

  const currentUnits = useMemo<InventoryUnitRWExtended[]>(() => {
    if (!request) return [];
    
    // Use new ManyToMany field if available
    // inventory_units_details is typed as string but actually returns an array from the API
    const unitsDetails = typeof request.inventory_units_details === 'string'
      ? (request.inventory_units_details ? JSON.parse(request.inventory_units_details) : [])
      : (request.inventory_units_details as any);
    if (Array.isArray(unitsDetails) && unitsDetails.length > 0) {
      return unitsDetails.map((unit: InventoryUnitRW) => ({
        ...unit,
        product_name: unit.product_template_name,
        sale_status_display: (unit as any).sale_status_display || unit.sale_status,
      }));
    }
    
    // Fallback to legacy single unit
    if (request.inventory_unit && request.inventory_unit_name) {
      return [{
        id: request.inventory_unit,
        product_template_name: request.inventory_unit_name,
        product_name: request.inventory_unit_name,
        serial_number: undefined,
        condition: undefined,
        grade: undefined,
        selling_price: '0',
        cost_of_unit: '0',
        sale_status: '',
        sale_status_display: '',
      } as InventoryUnitRWExtended];
    }
    
    return [];
  }, [request]);

  // Get selected units details - combine current units with newly added units from availableUnitsData
  const selectedUnitsDetails = useMemo<InventoryUnitRWExtended[]>(() => {
    const units: InventoryUnitRWExtended[] = [];
    const selectedIds = Array.from(selectedUnitIds);
    
    // First, add units from current request
    selectedIds.forEach(id => {
      const existingUnit = currentUnits.find((u: InventoryUnitRWExtended) => u.id === id);
      if (existingUnit) {
        units.push(existingUnit);
      } else if (availableUnitsData?.results) {
        // If not in current units, check if it's in available units (newly added)
        const availableUnit = availableUnitsData.results.find((u: InventoryUnitRW) => u.id === id);
        if (availableUnit) {
          // Convert to extended type
          units.push({
            ...availableUnit,
            product_name: availableUnit.product_template_name,
            sale_status_display: availableUnit.sale_status_display || availableUnit.sale_status,
          });
        }
      }
    });
    
    return units;
  }, [currentUnits, selectedUnitIds, availableUnitsData]);

  const filteredAvailableUnits = useMemo(() => {
    if (!availableUnitsData?.results) return [];
    
    const searchLower = unitSearch.toLowerCase();
    return availableUnitsData.results.filter((unit: InventoryUnitRW) => {
      // Exclude already selected units
      if (selectedUnitIds.has(unit.id!)) return false;
      
      // Only show available units
      if (unit.sale_status !== 'AV') return false;
      
      // Filter by search
      if (unitSearch) {
        const productName = unit.product_template_name || '';
        const serialNumber = unit.serial_number || '';
        return productName.toLowerCase().includes(searchLower) || 
               serialNumber.toLowerCase().includes(searchLower);
      }
      
      return true;
    }).slice(0, 20); // Limit to 20 results
  }, [availableUnitsData, unitSearch, selectedUnitIds]);

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading...</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading reservation request details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Error</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Failed to load reservation request details.</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reservation Request #{request.id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body reservation-request-details">
          {/* Request Info */}
          <div className="request-info-section">
            <h3>Request Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge status-${request.status?.toLowerCase() || 'unknown'}`}>
                  {request.status_display || request.status || 'Unknown'}
                </span>
              </div>
              <div className="info-item">
                <label>Requested By:</label>
                <span>{request.requesting_salesperson_username || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <label>Requested At:</label>
                <span>{request.requested_at ? formatDate(request.requested_at) : 'N/A'}</span>
              </div>
              {request.approved_at && (
                <div className="info-item">
                  <label>Approved At:</label>
                  <span>{formatDate(request.approved_at)}</span>
                </div>
              )}
              {request.approved_by_username && (
                <div className="info-item">
                  <label>Approved By:</label>
                  <span>{request.approved_by_username}</span>
                </div>
              )}
              {request.expires_at && (
                <div className="info-item">
                  <label>Expires At:</label>
                  <span>{formatDate(request.expires_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Units Section */}
          <div className="units-section">
            <div className="units-section-header">
              <h3>Inventory Units ({selectedUnitsDetails.length})</h3>
              {canEdit && (
                <button
                  className="btn-small btn-primary"
                  onClick={() => {
                    if (!isEditing) {
                      setIsEditing(true);
                    }
                    setShowUnitSearch(!showUnitSearch);
                  }}
                  disabled={updateMutation.isPending}
                >
                  {showUnitSearch ? 'Cancel' : '+ Add Unit'}
                </button>
              )}
            </div>

            {/* Unit Search (when adding) */}
            {showUnitSearch && canEdit && (
              <div className="unit-search-section">
                <input
                  type="text"
                  placeholder="Search available units by product name or serial number..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '0.5rem' }}
                  autoFocus
                />
                {isLoadingUnits && (
                  <p className="empty-state-message">
                    Loading available units...
                  </p>
                )}
                {!isLoadingUnits && filteredAvailableUnits.length > 0 && (
                  <div className="available-units-list">
                    {filteredAvailableUnits.map((unit: InventoryUnitRW) => (
                      <div
                        key={unit.id}
                        className="available-unit-item"
                        onClick={() => handleAddUnit(unit)}
                      >
                        <div>
                          <strong>{unit.product_template_name || 'Unknown Product'}</strong>
                          {unit.serial_number && <span> - SN: {unit.serial_number}</span>}
                        </div>
                        <div className="available-unit-details">
                          {unit.condition} {unit.grade && `- Grade ${unit.grade}`} - {getSaleStatusDisplay(unit.sale_status)}
                        </div>
                        {unit.selling_price && (
                          <div className="available-unit-price" data-price="true">
                            KES {parseFloat(unit.selling_price.toString()).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!isLoadingUnits && unitSearch && filteredAvailableUnits.length === 0 && (
                  <p className="empty-state-message">
                    No available units found matching "{unitSearch}"
                  </p>
                )}
                {!isLoadingUnits && !unitSearch && filteredAvailableUnits.length === 0 && availableUnitsData && (
                  <p className="empty-state-message">
                    No available units found. Try searching by product name or serial number.
                  </p>
                )}
              </div>
            )}

            {/* Current Units List */}
            <div className="units-list">
              {selectedUnitsDetails.length === 0 ? (
                <p className="empty-state-message">
                  No units in this request
                </p>
              ) : (
                selectedUnitsDetails.map((unit) => {
                  const isReserved = unit.sale_status === 'RS';
                  const isApproved = request?.status === 'AP';
                  const canCreateOrder = isSalesperson && isMyRequest && isApproved && isReserved;
                  
                  return (
                    <div key={unit.id} className="unit-item">
                      <div className="unit-info">
                        <div>
                          <strong>{unit.product_name || unit.product_template_name || 'Unknown'}</strong>
                          {unit.serial_number && <span> - SN: {unit.serial_number}</span>}
                        </div>
                        <div className="unit-details">
                          {unit.condition} {unit.grade && `- Grade ${unit.grade}`} - {(unit as InventoryUnitRWExtended).sale_status_display || getSaleStatusDisplay(unit.sale_status || '')}
                        </div>
                        <div className="unit-price" data-price="true">
                          KES {unit.selling_price ? parseFloat(unit.selling_price.toString()).toLocaleString() : '0.00'}
                        </div>
                      </div>
                      <div className="unit-actions">
                        {canCreateOrder && (
                          <button
                            className="btn-primary"
                            onClick={() => handleCreateOrder(unit)}
                            disabled={createOrderMutation.isPending}
                            title="Create order from this reserved unit"
                          >
                            {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                          </button>
                        )}
                        {canEdit && (
                          <button
                            className="btn-secondary"
                            onClick={() => unit.id && handleRemoveUnit(unit.id)}
                            disabled={selectedUnitsDetails.length <= 1 || updateMutation.isPending}
                            title={selectedUnitsDetails.length <= 1 ? 'At least one unit must remain' : 'Remove unit'}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="notes-section">
            <h3>Notes</h3>
            {canEdit ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-control"
                rows={4}
                placeholder="Add notes about this reservation request..."
                disabled={updateMutation.isPending}
              />
            ) : (
              <div className="notes-display">
                {request.notes || <em className="notes-empty">No notes</em>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            {canEdit ? (
              <>
                <button
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || selectedUnitIds.size === 0}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                className="btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrderModal && selectedUnitForOrder && (
        <div className="modal-overlay" onClick={() => setShowCreateOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Create Order from Reserved Unit</h2>
              <button className="modal-close" onClick={() => setShowCreateOrderModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-unit-summary">
                <div><strong>Product:</strong> {(selectedUnitForOrder as InventoryUnitRWExtended).product_name || selectedUnitForOrder.product_template_name || 'Unknown'}</div>
                {selectedUnitForOrder.serial_number && (
                  <div><strong>Serial Number:</strong> {selectedUnitForOrder.serial_number}</div>
                )}
                <div><strong>Price:</strong> <span data-price="true">KES {selectedUnitForOrder.selling_price ? parseFloat(selectedUnitForOrder.selling_price.toString()).toLocaleString() : '0.00'}</span></div>
                <div><strong>Status:</strong> {(selectedUnitForOrder as InventoryUnitRWExtended).sale_status_display || getSaleStatusDisplay(selectedUnitForOrder.sale_status || '')}</div>
                {brandForOrder && (
                  <div className="order-brand-info">
                    <strong>Brand:</strong> {brandForOrder.name} {isWebsiteBrand && <span className="website-brand-badge">(Website Brand)</span>}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="customer_name">
                  Customer Name <span className="required-asterisk">*</span>
                </label>
                <input
                  id="customer_name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-control"
                  placeholder="Enter customer name"
                  required
                  disabled={createOrderMutation.isPending}
                />
                <small className="form-help-text">
                  {isWebsiteBrand && isSearchingCustomer && 'Searching for customer...'}
                  {isWebsiteBrand && !isSearchingCustomer && 'Name will be auto-filled if customer is found by phone'}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="customer_phone">
                  Customer Phone Number <span className="required-asterisk">*</span>
                </label>
                <input
                  id="customer_phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="form-control"
                  placeholder="Enter customer phone number"
                  required
                  disabled={createOrderMutation.isPending}
                />
                <small className="form-help-text">
                  {isWebsiteBrand 
                    ? 'Enter phone number to search for existing customer (name will be auto-filled if found)'
                    : 'Enter customer phone number'}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="customer_email">
                  Customer Email (optional)
                </label>
                <input
                  id="customer_email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter customer email"
                  disabled={createOrderMutation.isPending}
                />
              </div>

              <div className="form-group">
                <label htmlFor="delivery_address">
                  Delivery Address (optional)
                </label>
                <textarea
                  id="delivery_address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="form-control"
                  placeholder="Enter delivery address"
                  rows={3}
                  disabled={createOrderMutation.isPending}
                />
              </div>

              <div className="order-warning-note">
                <strong>Note:</strong> Creating an order will transition this unit from <strong>Reserved</strong> to <strong>Pending Payment</strong>. 
                The unit will be marked as <strong>Sold</strong> when payment is confirmed.
                {brandForOrder && (
                  <div className="order-warning-brand">
                    <strong>Brand:</strong> {brandForOrder.name} (automatically assigned)
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCreateOrderModal(false);
                  setSelectedUnitForOrder(null);
                  setCustomerName('');
                  setCustomerPhone('');
                }}
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitOrder}
                disabled={createOrderMutation.isPending || !customerName.trim() || !customerPhone.trim() || !brandForOrder}
              >
                {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

