import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PromotionsService,
  ProductsService,
  Promotion,
  Brand,
  ProductTemplate,
} from '../api/index';
import { PromotionForm } from './PromotionForm';

interface ProductPromotionModalProps {
  productIds: number[]; // Can be single or multiple products
  onClose: () => void;
  onSuccess: () => void;
  adminBrands: Brand[];
  mode?: 'create' | 'attach' | 'edit';
  existingPromotion?: Promotion | null;
}

export const ProductPromotionModal: React.FC<ProductPromotionModalProps> = ({
  productIds,
  onClose,
  onSuccess,
  adminBrands,
  mode = 'create',
  existingPromotion = null,
}) => {
  const [currentMode, setCurrentMode] = useState<'create' | 'attach'>(mode === 'edit' ? 'create' : mode);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null);

  // Fetch all promotions for attaching
  const { data: promotionsData } = useQuery({
    queryKey: ['promotions-all-for-attach'],
    queryFn: async () => {
      let allPromotions: Promotion[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await PromotionsService.promotionsList(currentPage);
        if (response.results && response.results.length > 0) {
          allPromotions = [...allPromotions, ...response.results];
          hasMore = !!response.next;
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      return allPromotions;
    },
    enabled: currentMode === 'attach',
  });

  // Fetch product details for display
  const { data: productsData } = useQuery({
    queryKey: ['products-for-promotion', productIds],
    queryFn: async () => {
      const products: ProductTemplate[] = [];
      for (const productId of productIds) {
        try {
          const product = await ProductsService.productsRetrieve(productId);
          products.push(product);
        } catch (err) {
          console.error(`Failed to fetch product ${productId}:`, err);
        }
      }
      return products;
    },
    enabled: productIds.length > 0,
  });

  const handleAttachPromotion = async () => {
    if (!selectedPromotionId) return;

    try {
      // Get the promotion
      const promotion = await PromotionsService.promotionsRetrieve(selectedPromotionId);
      
      // Merge product IDs
      const currentProducts = promotion.products || [];
      const newProducts = [...new Set([...currentProducts, ...productIds])];
      
      // Update promotion with merged products
      // banner_image is string in Promotion but Blob in PatchedPromotionRequest - exclude it
      const { banner_image, ...promotionWithoutBanner } = promotion as any;
      await PromotionsService.promotionsPartialUpdate(selectedPromotionId, {
        ...promotionWithoutBanner,
        products: newProducts,
      } as any);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Failed to attach promotion: ${err?.message || 'Unknown error'}`);
    }
  };

  const handlePromotionFormSuccess = () => {
    onSuccess();
    onClose();
  };

  // If editing, show the form directly
  if (mode === 'edit' && existingPromotion) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Edit Promotion</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            {productsData && productsData.length > 0 && (
              <div className="selected-products-info">
                <strong>Products:</strong>
                <ul>
                  {productsData.map((product) => (
                    <li key={product.id}>{product.product_name}</li>
                  ))}
                </ul>
              </div>
            )}
            <PromotionForm
              promotion={existingPromotion}
              onClose={onClose}
              onSuccess={handlePromotionFormSuccess}
              adminBrands={adminBrands}
            />
          </div>
        </div>
      </div>
    );
  }

  // If no product IDs, allow creating promotion without pre-selected products
  // (user can select products in the PromotionForm)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {productIds.length === 0 
              ? 'Create Promotion' 
              : productIds.length === 1 
                ? 'Add Promotion to Product' 
                : `Add Promotion to ${productIds.length} Products`}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {productsData && productsData.length > 0 && (
            <div className="selected-products-info">
              <strong>Selected {productsData.length === 1 ? 'Product' : 'Products'}:</strong>
              <ul>
                {productsData.map((product) => (
                  <li key={product.id}>{product.product_name}</li>
                ))}
              </ul>
            </div>
          )}
          {productIds.length === 0 && (
            <div className="selected-products-info" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107' }}>
              <strong>Note:</strong> No products pre-selected. You can select products in the promotion form below.
            </div>
          )}

          {/* Mode Selection */}
          <div className="promotion-mode-selector">
            <button
              className={`mode-button ${currentMode === 'create' ? 'active' : ''}`}
              onClick={() => setCurrentMode('create')}
            >
              Create New Promotion
            </button>
            <button
              className={`mode-button ${currentMode === 'attach' ? 'active' : ''}`}
              onClick={() => setCurrentMode('attach')}
            >
              Attach Existing Promotion
            </button>
          </div>

          {currentMode === 'create' ? (
            <PromotionForm
              promotion={null}
              onClose={onClose}
              onSuccess={handlePromotionFormSuccess}
              adminBrands={adminBrands}
              preSelectedProductIds={productIds}
            />
          ) : (
            <div className="attach-promotion-section">
              <h3>Select a Promotion to Attach</h3>
              {promotionsData && promotionsData.length > 0 ? (
                <>
                  <div className="promotions-list">
                    {promotionsData.map((promotion) => (
                      <div
                        key={promotion.id}
                        className={`promotion-item ${selectedPromotionId === promotion.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPromotionId(promotion.id || null)}
                      >
                        <div className="promotion-item-header">
                          <input
                            type="radio"
                            checked={selectedPromotionId === promotion.id}
                            onChange={() => setSelectedPromotionId(promotion.id || null)}
                          />
                          <h4>{promotion.title}</h4>
                        </div>
                        {promotion.description && (
                          <p className="promotion-description">{promotion.description}</p>
                        )}
                        <div className="promotion-details">
                          {promotion.discount_percentage && (
                            <span className="discount-badge">{promotion.discount_percentage}% OFF</span>
                          )}
                          {promotion.discount_amount && (
                            <span className="discount-badge">KES {promotion.discount_amount} OFF</span>
                          )}
                          {promotion.is_currently_active && (
                            <span className="status-badge active">Active</span>
                          )}
                          {!promotion.is_currently_active && (
                            <span className="status-badge inactive">Inactive</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAttachPromotion}
                      disabled={!selectedPromotionId}
                    >
                      Attach Promotion
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-promotions">
                  <p>No promotions available. Create a new promotion first.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentMode('create')}
                  >
                    Create New Promotion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

