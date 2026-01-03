import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '../api/index';

interface ProductStockSummaryModalProps {
  productId: number;
  onClose: () => void;
}

export const ProductStockSummaryModal: React.FC<ProductStockSummaryModalProps> = ({
  productId,
  onClose,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-stock-summary', productId],
    queryFn: async () => {
      try {
        return await ProductsService.productsStockSummaryRetrieve(productId);
      } catch (err: any) {
        // Log the full error for debugging
        console.error('Stock summary error:', err);
        console.error('Error details:', {
          message: err?.message,
          status: err?.status,
          url: err?.url,
          body: err?.body,
        });
        throw err;
      }
    },
    enabled: !!productId,
    retry: 1,
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Stock Summary</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="stock-summary-content">
            {isLoading && <div className="loading">Loading stock summary...</div>}
            {error && (
              <div className="error-message">
                <p><strong>Error loading stock summary:</strong></p>
                <p>
                  {(error as any)?.message || 
                   (error as any)?.body?.detail || 
                   (error as any)?.body?.message ||
                   (typeof error === 'string' ? error : 'Network Error')}
                </p>
                {(error as any)?.status && (
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Status: {(error as any).status}
                  </p>
                )}
                {(error as any)?.url && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--md-on-surface-variant)' }}>
                    URL: {(error as any).url}
                  </p>
                )}
              </div>
            )}
            {data && (
              <div className="stock-summary-data">
                <div className="summary-item">
                  <label>Product Name:</label>
                  <span>{data.product_name || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <label>Available Stock:</label>
                  <span className="stock-value">{(data as any).available_stock || 0} units</span>
                </div>
                <div className="summary-item">
                  <label>Price Range:</label>
                  <span>
                    {(data as any).currency || 'KES'} {(data as any).min_price ? Number((data as any).min_price).toFixed(2) : '0.00'} - {(data as any).max_price ? Number((data as any).max_price).toFixed(2) : '0.00'}
                  </span>
                </div>
                {((data as any).available_stock === 0) && (
                  <div className="warning-message">
                    No available stock for this product.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

