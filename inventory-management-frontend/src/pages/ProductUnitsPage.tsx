import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ProductsService,
  ProfilesService,
  InventoryUnitRW,
} from '../api/index';
import { UnitForm } from '../components/UnitForm';
import { UnitDetailsModal } from '../components/UnitDetailsModal';
import { BulkReserveUnitsModal } from '../components/BulkReserveUnitsModal';

export const ProductUnitsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [page] = useState(1); // Page is always 1 for product units - pagination not implemented yet
  const [editingUnit, setEditingUnit] = useState<InventoryUnitRW | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [showBulkReserveModal, setShowBulkReserveModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Fetch admin profile to check roles
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff && isAuthenticated,
  });

  // Fetch product details
  const { data: productData } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductsService.productsRetrieve(Number(productId)),
    enabled: !!productId,
  });

  // Check superuser status from adminProfile.user if available
  const isSuperuser = adminProfile?.user?.is_superuser === true;

  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isSalesperson = hasRole('SP') && !isSuperuser;
  const isInventoryManager = hasRole('IM');

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

  // Fetch units filtered by product ID using server-side filtering
  const { data, isLoading, error } = useQuery({
    queryKey: ['units', 'product', productId, page],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      const pageSize = 100;
      
      // Use server-side filtering via query parameter
      const url = `${baseUrl}/units/?product_template=${productId}&page=${page}&page_size=${pageSize}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required or invalid.');
        }
        throw new Error(`Failed to fetch units: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    },
    enabled: !authLoading && isAuthenticated && !!productId,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Mutations removed - not used in minimal card view (actions available in modal)
  // const deleteMutation = useMutation({
  //   mutationFn: (id: number) => CoreCatalogInventoryManagementService.deleteInventoryUnit(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['units'] });
  //     alert('Unit deleted successfully');
  //   },
  //   onError: (err: any) => {
  //     alert(`Failed to delete unit: ${err.message || 'Unknown error'}`);
  //   },
  // });

  // const approveBuybackMutation = useMutation({
  //   mutationFn: (id: number) => CoreCatalogInventoryManagementService.approveBuyback(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['units'] });
  //     alert('Buyback item approved and made available');
  //   },
  //   onError: (err: any) => {
  //     alert(`Failed to approve buyback: ${err.message || 'Unknown error'}`);
  //   },
  // });

  // const createReservationMutation = useMutation({
  //   mutationFn: (unitId: number) => RequestManagementService.createReservationRequest({
  //     inventory_unit_id: unitId,
  //   }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['units'] });
  //     queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
  //     alert('Reservation request created successfully');
  //   },
  //   onError: (err: any) => {
  //     alert(`Failed to create reservation request: ${err.message || 'Unknown error'}`);
  //   },
  // });

  // const createTransferMutation = useMutation({
  //   mutationFn: ({ unitId, toSalespersonId }: { unitId: number; toSalespersonId: number }) =>
  //     RequestManagementService.createUnitTransfer({
  //       inventory_unit_id: unitId,
  //       to_salesperson_id: toSalespersonId,
  //     }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['units'] });
  //     queryClient.invalidateQueries({ queryKey: ['unit-transfers'] });
  //     alert('Transfer request created successfully');
  //   },
  //   onError: (err: any) => {
  //     alert(`Failed to create transfer request: ${err.message || 'Unknown error'}`);
  //   },
  // });

  // Handlers removed - not used in minimal card view (actions available in modal)
  // const handleReserve = (unit: InventoryUnitRW) => {
  //   if (!unit.id) return;
  //   const unitName = unit.product_template_name || `Unit #${unit.id}`;
  //   if (window.confirm(`Request reservation for "${unitName}"?`)) {
  //     createReservationMutation.mutate(unit.id);
  //   }
  // };

  // const handleTransfer = (unit: InventoryUnitRW) => {
  //   if (!unit.id) return;
  //   const toSalespersonId = prompt('Enter the ID of the salesperson to transfer to:');
  //   if (toSalespersonId && !isNaN(Number(toSalespersonId))) {
  //     createTransferMutation.mutate({ unitId: unit.id, toSalespersonId: Number(toSalespersonId) });
  //   } else if (toSalespersonId !== null) {
  //     alert('Please enter a valid salesperson ID');
  //   }
  // };

  // const handleDelete = (unit: InventoryUnitRW) => {
  //   if (!unit.id) return;
  //   const unitName = unit.product_template_name || `Unit #${unit.id}`;
  //   if (window.confirm(`Are you sure you want to delete "${unitName}"?`)) {
  //     deleteMutation.mutate(unit.id);
  //   }
  // };

  // const handleEdit = (unit: InventoryUnitRW) => {
  //   setEditingUnit(unit);
  //   setShowCreateModal(true);
  // };

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

  const units = data?.results || [];

  if (isLoading) {
    return <div className="loading">Loading units...</div>;
  }

  if (error) {
    return <div className="error">Error loading units: {(error as Error).message}</div>;
  }

  return (
    <div className="product-units-page">
      <div className="page-header">
        <div>
          <button 
            className="btn-back" 
            onClick={() => navigate('/products')}
            style={{ marginBottom: '0.5rem', background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            ← Back to Products
          </button>
          <h1>{productData?.product_name || 'Product'} - Inventory Units</h1>
          {productData?.brand && (
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              {productData.brand} {productData.model_series || ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(isInventoryManager || isSuperuser) && (
            <button className="btn-primary" onClick={handleCreate}>
              + Add Unit
            </button>
          )}
          {(isSalesperson || isSuperuser) && (
            <button 
              className="btn-primary" 
              onClick={() => setShowBulkReserveModal(true)}
              style={{ background: '#059669' }}
            >
              Reserve Units
            </button>
          )}
        </div>
      </div>

      {units.length === 0 ? (
        <div className="empty-state">
          No inventory units found for this product.
          {(isInventoryManager || isSuperuser) && (
            <button 
              className="btn-primary" 
              onClick={handleCreate}
              style={{ marginTop: '1rem' }}
            >
              Create First Unit
            </button>
          )}
        </div>
      ) : (
        <div className="product-units-grid">
          {units.map((unit: InventoryUnitRW) => {
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
                className="product-unit-card"
                onClick={() => unit.id && setSelectedUnitId(unit.id)}
              >
                <div className="product-unit-card-image">
                  {fullImageUrl ? (
                    <img 
                      src={fullImageUrl} 
                      alt={unit.product_template_name || 'Unit image'} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="product-unit-card-placeholder">
                      <span>No Image</span>
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
                  {unit.images && unit.images.length > 1 && (
                    <div className="image-count-badge">
                      +{unit.images.length - 1}
                    </div>
                  )}
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

      {showCreateModal && (
        <UnitForm
          unit={editingUnit}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          defaultProductId={productId ? Number(productId) : undefined}
        />
      )}

      {selectedUnitId && (
        <UnitDetailsModal
          unitId={selectedUnitId}
          onClose={() => setSelectedUnitId(null)}
          isEditable={isInventoryManager || isSuperuser}
        />
      )}

      {showBulkReserveModal && (
        <BulkReserveUnitsModal
          productId={Number(productId)}
          availableUnits={units}
          onClose={() => setShowBulkReserveModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['units'] });
            queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
          }}
        />
      )}
    </div>
  );
};

