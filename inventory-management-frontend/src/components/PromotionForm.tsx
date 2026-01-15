import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  PromotionsService,
  Promotion,
  Brand,
} from '../api/index';
import { useDebounce } from '../hooks/useDebounce';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';

interface PromotionFormProps {
  promotion?: Promotion | null;
  onClose: () => void;
  onSuccess: () => void;
  adminBrands: Brand[];
  preSelectedProductIds?: number[]; // Pre-select products when creating from Products page
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  promotion,
  onClose,
  onSuccess,
  adminBrands,
  preSelectedProductIds = [],
}) => {
  // Use preSelectedProductIds if provided and no existing promotion, otherwise use promotion products
  const initialProductIds = promotion?.products || preSelectedProductIds;
  
  // Use admin's brands - only show brands the admin is associated with
  // Extract brands from adminBrands prop (already filtered by backend)
  const availableBrands = useMemo(() => {
    // Filter to only active brands
    return adminBrands.filter((b: Brand) => b.is_active !== false);
  }, [adminBrands]);

  const [formData, setFormData] = useState({
    brand: promotion?.brand || '',
    promotion_type: (promotion as any)?.promotion_type || '',
    promotion_code: (promotion as any)?.promotion_code || '',
    title: promotion?.title || '',
    description: promotion?.description || '',
    banner_image: null as File | null,
    discount_percentage: promotion?.discount_percentage?.toString() || '',
    discount_amount: promotion?.discount_amount?.toString() || '',
    start_date: promotion?.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '',
    end_date: promotion?.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
    is_active: promotion?.is_active !== undefined ? promotion.is_active : true,
    product_types: promotion?.product_types || '',
    products: initialProductIds as number[],
    display_locations: (promotion as any)?.display_locations || [] as string[],
    carousel_position: (promotion as any)?.carousel_position || null as number | null,
  });


  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set(initialProductIds)
  );
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const productSearchInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Debounce search term for better performance
  const debouncedProductSearch = useDebounce(productSearch, 300);

  // Clear products error when product type is selected
  useEffect(() => {
    if (formData.product_types && errors.products) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.products;
        return newErrors;
      });
    }
  }, [formData.product_types, errors.products]);

  // Fetch promotion types
  const { data: promotionTypesData } = useQuery({
    queryKey: ['promotion-types'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
      
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
        }
      }
      
      const response = await fetch(`${baseUrl}/promotion-types/?is_active=true`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch promotion types');
      }
      
      return await response.json();
    },
  });

  // Fetch products with pagination for selection
  const { products: allProducts } = usePaginatedProducts();
  
  // Create productsData array compatible with existing code
  const productsData = useMemo(() => allProducts, [allProducts]);

  // Filter products by search, brand, and product type
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    
    let filtered = productsData;
    
    // Filter by selected brand (if brand is selected)
    if (formData.brand && formData.brand !== '') {
      const brandId = typeof formData.brand === 'number' ? formData.brand : parseInt(formData.brand);
      if (!isNaN(brandId)) {
      filtered = filtered.filter((p) => {
        // Check if product is associated with the selected brand
          // Products can have brands array (array of objects with id property) or be global
        const productBrands = (p as any).brands || [];
          
          // If product has no brands assigned, it's available to all brands
          if (!Array.isArray(productBrands) || productBrands.length === 0) {
            return true;
          }
          
          // Check if product is global (available to all brands)
          if ((p as any).is_global === true) {
            return true;
          }
          
          // Check if any brand in the product's brands array matches the selected brand
          const hasBrand = productBrands.some((b: any) => {
            const brandObjId = typeof b === 'object' ? b.id : b;
            return brandObjId === brandId;
          });
          
          return hasBrand;
        });
      }
    }
    
    // Filter by product type if selected
    if (formData.product_types) {
      filtered = filtered.filter((p) => {
        return p.product_type === formData.product_types;
      });
    }
    
    // Filter by search (use debounced search for dropdown, but immediate for display)
    const searchTerm = debouncedProductSearch || productSearch;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        return p.product_name?.toLowerCase().includes(searchLower);
      });
    }
    
    // Limit results for dropdown (show top 20 matches)
    return filtered.slice(0, 20);
  }, [productsData, formData.brand, formData.product_types, productSearch, debouncedProductSearch]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // If there's a file upload, use FormData
      if (data.banner_image) {
        const formDataToSend = new FormData();
        
        // Add all fields to FormData
        Object.keys(data).forEach((key) => {
          if (key === 'banner_image' && data[key]) {
            formDataToSend.append('banner_image', data[key]);
          } else if (key === 'products' && Array.isArray(data[key])) {
            data[key].forEach((id: number) => {
              formDataToSend.append('products', id.toString());
            });
          } else if (key === 'display_locations' && Array.isArray(data[key])) {
            // display_locations must be sent as JSON string for FormData
            formDataToSend.append(key, JSON.stringify(data[key]));
          } else if (key === 'carousel_position' && data[key] !== null && data[key] !== undefined) {
            formDataToSend.append(key, data[key].toString());
          } else if (key === 'is_active') {
            // Explicitly handle boolean as string 'true'/'false'
            formDataToSend.append(key, data[key] ? 'true' : 'false');
          } else if (key === 'start_date' || key === 'end_date') {
            formDataToSend.append(key, data[key]);
          } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formDataToSend.append(key, data[key].toString());
          }
        });
        
        // Use direct fetch for FormData
        const token = localStorage.getItem('auth_token');
        let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        
        // Auto-detect base URL from hostname (same logic as config.ts)
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
            baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
          }
        }
        
        const response = await fetch(`${baseUrl}/promotions/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formDataToSend,
        });
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
          }
          const error = new Error(errorData.detail || errorData.message || 'Failed to create promotion');
          (error as any).response = { data: errorData, status: response.status };
          throw error;
        }
        
        return await response.json();
      } else {
        // No file upload, use JSON
        return PromotionsService.promotionsCreate(data as any);
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      const errorData = err?.response?.data;
      if (errorData) {
        const fieldErrors: Record<string, string> = {};
        Object.keys(errorData).forEach((key) => {
          if (Array.isArray(errorData[key])) {
            fieldErrors[key] = errorData[key][0];
          } else if (typeof errorData[key] === 'string') {
            fieldErrors[key] = errorData[key];
          } else if (errorData.non_field_errors) {
            fieldErrors['non_field_errors'] = Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors[0]
              : errorData.non_field_errors;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ non_field_errors: err?.message || 'Failed to create promotion' });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!promotion?.id) throw new Error('Promotion ID is required');
      
      // If there's a file upload, use FormData
      if (data.banner_image) {
        const formDataToSend = new FormData();
        
        // Add all fields to FormData
        Object.keys(data).forEach((key) => {
          if (key === 'banner_image' && data[key]) {
            formDataToSend.append('banner_image', data[key]);
          } else if (key === 'products' && Array.isArray(data[key])) {
            data[key].forEach((id: number) => {
              formDataToSend.append('products', id.toString());
            });
          } else if (key === 'display_locations' && Array.isArray(data[key])) {
            // display_locations must be sent as JSON string for FormData
            formDataToSend.append(key, JSON.stringify(data[key]));
          } else if (key === 'carousel_position' && data[key] !== null && data[key] !== undefined) {
            formDataToSend.append(key, data[key].toString());
          } else if (key === 'is_active') {
            // Explicitly handle boolean as string 'true'/'false'
            formDataToSend.append(key, data[key] ? 'true' : 'false');
          } else if (key === 'start_date' || key === 'end_date') {
            formDataToSend.append(key, data[key]);
          } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formDataToSend.append(key, data[key].toString());
          }
        });
        
        // Use direct fetch for FormData
        const token = localStorage.getItem('auth_token');
        let baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        
        // Auto-detect base URL from hostname (same logic as config.ts)
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          if (hostname !== 'localhost' && hostname !== '127.0.0.1' && baseUrl.includes('localhost')) {
            baseUrl = baseUrl.replace('localhost', hostname).replace('127.0.0.1', hostname);
          }
        }
        
        const response = await fetch(`${baseUrl}/promotions/${promotion.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formDataToSend,
        });
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
          }
          const error = new Error(errorData.detail || errorData.message || 'Failed to update promotion');
          (error as any).response = { data: errorData, status: response.status };
          throw error;
        }
        
        return await response.json();
      } else {
        // No file upload, use JSON
        return PromotionsService.promotionsPartialUpdate(promotion.id, data as any);
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      const errorData = err?.response?.data;
      if (errorData) {
        const fieldErrors: Record<string, string> = {};
        Object.keys(errorData).forEach((key) => {
          if (Array.isArray(errorData[key])) {
            fieldErrors[key] = errorData[key][0];
          } else if (typeof errorData[key] === 'string') {
            fieldErrors[key] = errorData[key];
          } else if (errorData.non_field_errors) {
            fieldErrors['non_field_errors'] = Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors[0]
              : errorData.non_field_errors;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ non_field_errors: err?.message || 'Failed to update promotion' });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const validationErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      validationErrors.title = 'Title is required';
    }

    if (!formData.brand) {
      validationErrors.brand = 'Brand is required';
    }

    if (!formData.promotion_type) {
      validationErrors.promotion_type = 'Promotion type is required';
    }

    // Require at least one display location
    if (!formData.display_locations || formData.display_locations.length === 0) {
      validationErrors.display_locations = 'At least one display location must be selected';
    }

    // Require at least one product or product type
    if (!formData.product_types && selectedProductIds.size === 0) {
      validationErrors.products = 'At least one product or product type must be specified';
    }

    // Cannot use both discount types
    if (formData.discount_percentage && formData.discount_amount) {
      validationErrors.discount = 'Cannot use both discount percentage and discount amount';
    }

    // Require at least one discount
    if (!formData.discount_percentage && !formData.discount_amount) {
      validationErrors.discount = 'Either discount percentage or discount amount is required';
    }

    // Validate dates
    if (!formData.start_date) {
      validationErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      validationErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start >= end) {
        validationErrors.end_date = 'End date must be after start date';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare data
    const brandId = typeof formData.brand === 'number' 
      ? formData.brand 
      : (formData.brand ? parseInt(formData.brand) : null);
    
    if (!brandId) {
      setErrors({ brand: 'Brand is required' });
      return;
    }
    
    const submitData: any = {
      brand: brandId,
      promotion_type: typeof formData.promotion_type === 'number' ? formData.promotion_type : parseInt(formData.promotion_type),
      title: formData.title,
      description: formData.description,
      promotion_code: formData.promotion_code || undefined,
      display_locations: Array.isArray(formData.display_locations) 
        ? formData.display_locations 
        : [],
      carousel_position: formData.carousel_position || null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      is_active: formData.is_active,
      products: Array.from(selectedProductIds),
    };

    if (formData.banner_image) {
      submitData.banner_image = formData.banner_image;
    }

    if (formData.discount_percentage) {
      submitData.discount_percentage = parseFloat(formData.discount_percentage);
    } else if (formData.discount_amount) {
      submitData.discount_amount = parseFloat(formData.discount_amount);
    }

    if (formData.product_types) {
      submitData.product_types = formData.product_types;
    }

    if (promotion?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{promotion ? 'Edit Promotion' : 'Create Promotion'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="promotion-form">
          {errors.non_field_errors && (
            <div className="error-message">{errors.non_field_errors}</div>
          )}

          <div className="form-group">
            <label htmlFor="brand">
              Brand <span className="required">*</span>
            </label>
            {availableBrands.length === 0 ? (
              <div style={{ padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', fontSize: '14px', color: '#856404' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ No brands available</div>
                <div>
                  {adminBrands.length === 0 ? (
                    <>You are not associated with any brands. Please contact an administrator to assign you to a brand.</>
                  ) : (
                    <>No active brands found. Please contact an administrator to activate a brand.</>
                  )}
                </div>
              </div>
            ) : availableBrands.length === 1 ? (
              <div style={{ padding: '8px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px', fontSize: '14px' }}>
                <strong>Brand:</strong> {availableBrands[0].name || availableBrands[0].code}
                <input
                  type="hidden"
                  id="brand"
                  value={formData.brand || availableBrands[0].id?.toString() || ''}
                />
              </div>
            ) : (
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              >
                <option value="">Select Brand</option>
                {availableBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name || brand.code}
                  </option>
                ))}
              </select>
            )}
            {errors.brand && <span className="error-text">{errors.brand}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="promotion_type">
              Promotion Type <span className="required">*</span>
            </label>
            <select
              id="promotion_type"
              value={formData.promotion_type}
              onChange={(e) => setFormData({ ...formData, promotion_type: e.target.value })}
              required
              disabled={isLoading}
            >
              <option value="">Select Promotion Type</option>
              {promotionTypesData?.results?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.promotion_type && <span className="error-text">{errors.promotion_type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="promotion_code">
              Promotion Code
            </label>
            <input
              id="promotion_code"
              type="text"
              value={formData.promotion_code}
              onChange={(e) => setFormData({ ...formData, promotion_code: e.target.value })}
              placeholder="Auto-generated if left empty"
              disabled={isLoading}
            />
            <small className="form-help">Leave empty to auto-generate, or enter a custom code</small>
            {errors.promotion_code && <span className="error-text">{errors.promotion_code}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isLoading}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="banner_image">Banner Image</label>
            <input
              id="banner_image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, banner_image: file });
                }
              }}
              disabled={isLoading}
            />
            {promotion?.banner_image && !formData.banner_image && (
              <div className="current-image">
                <img src={promotion.banner_image} alt="Current banner" className="image-preview" />
              </div>
            )}
            {errors.banner_image && <span className="error-text">{errors.banner_image}</span>}
            <small className="form-help">Required if "Stories Carousel" is selected as a display location</small>
          </div>

          <div className="form-group">
            <label>
              Display Locations <span className="required">*</span>
            </label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.display_locations.includes('stories_carousel')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        display_locations: [...formData.display_locations, 'stories_carousel'],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        display_locations: formData.display_locations.filter((loc: string) => loc !== 'stories_carousel'),
                      });
                    }
                  }}
                  disabled={isLoading}
                />
                <span>Stories Carousel (requires banner image)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.display_locations.includes('special_offers')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        display_locations: [...formData.display_locations, 'special_offers'],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        display_locations: formData.display_locations.filter((loc: string) => loc !== 'special_offers'),
                      });
                    }
                  }}
                  disabled={isLoading}
                />
                <span>Special Offers Section</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.display_locations.includes('flash_sales')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        display_locations: [...formData.display_locations, 'flash_sales'],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        display_locations: formData.display_locations.filter((loc: string) => loc !== 'flash_sales'),
                      });
                    }
                  }}
                  disabled={isLoading}
                />
                <span>Flash Sales Section</span>
              </label>
            </div>
            {errors.display_locations && <span className="error-text">{errors.display_locations}</span>}
            
            {/* Layout Position Placeholders for Stories Carousel */}
            {formData.display_locations.includes('stories_carousel') && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '12px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                  Stories Carousel Layout Positions:
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Desktop Layout Preview */}
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Desktop Layout:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '400px' }}>
                      {/* Large Banner (Position 1) */}
                      <div style={{ 
                        gridColumn: '1', 
                        gridRow: '1 / 3',
                        aspectRatio: '1',
                        backgroundColor: '#e5e7eb',
                        border: '2px dashed #9ca3af',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>1</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Banner</div>
                      </div>
                      {/* 2x2 Grid */}
                      <div style={{ 
                        gridColumn: '2',
                        gridRow: '1',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>2</div>
                        </div>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>3</div>
                        </div>
                      </div>
                      <div style={{ 
                        gridColumn: '2',
                        gridRow: '2',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>4</div>
                        </div>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Layout Preview */}
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Mobile Layout:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '200px' }}>
                      {/* Banner (Position 1) */}
                      <div style={{ 
                        aspectRatio: '2',
                        backgroundColor: '#e5e7eb',
                        border: '2px dashed #9ca3af',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280' }}>1</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Banner</div>
                      </div>
                      {/* 2x2 Grid */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}>2</div>
                        </div>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}>3</div>
                        </div>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}>4</div>
                        </div>
                        <div style={{ 
                          aspectRatio: '1',
                          backgroundColor: '#e5e7eb',
                          border: '2px dashed #9ca3af',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}>5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Select Carousel Position:
                  </label>
                  <select
                    value={formData.carousel_position || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        carousel_position: e.target.value ? parseInt(e.target.value) : null,
                      });
                    }}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select Position (Optional) --</option>
                    <option value="1">Position 1 - Large Banner</option>
                    <option value="2">Position 2 - Top Left Grid</option>
                    <option value="3">Position 3 - Top Right Grid</option>
                    <option value="4">Position 4 - Bottom Left Grid</option>
                    <option value="5">Position 5 - Bottom Right Grid</option>
                  </select>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                    Select a specific position for this promotion in the carousel. If not selected, promotions will be assigned automatically based on creation order.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discount_percentage">Discount Percentage (%)</label>
              <input
                id="discount_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    discount_percentage: e.target.value,
                    discount_amount: '', // Clear the other field
                  });
                }}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount_amount">Discount Amount (KES)</label>
              <input
                id="discount_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_amount}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    discount_amount: e.target.value,
                    discount_percentage: '', // Clear the other field
                  });
                }}
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.discount && <span className="error-text">{errors.discount}</span>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">
                Start Date <span className="required">*</span>
              </label>
              <input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                disabled={isLoading}
              />
              {errors.start_date && <span className="error-text">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_date">
                End Date <span className="required">*</span>
              </label>
              <input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                disabled={isLoading}
              />
              {errors.end_date && <span className="error-text">{errors.end_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product_types">Product Type (Optional - applies to all products of this type)</label>
            <select
              id="product_types"
              value={formData.product_types}
              onChange={(e) => setFormData({ ...formData, product_types: e.target.value })}
              disabled={isLoading}
            >
              <option value="">None (select specific products below)</option>
              <option value="PH">Phones</option>
              <option value="LT">Laptops</option>
              <option value="TB">Tablets</option>
              <option value="AC">Accessories</option>
            </select>
            <small className="form-help">If selected, promotion applies to all products of this type for the selected brand.</small>
          </div>

          <div className="form-group">
            <label>
              Products <span className="required">*</span> 
              {formData.product_types ? (
                <span className="filter-indicator">
                  {' '}(filtered by {
                    formData.product_types === 'PH' ? 'Phones' : 
                    formData.product_types === 'LT' ? 'Laptops' : 
                    formData.product_types === 'TB' ? 'Tablets' : 
                    'Accessories'
                  })
                </span>
              ) : (
                <span> (if product type not selected)</span>
              )}
            </label>
            <div className="product-search-container">
              <div className="product-search-input-wrapper">
                {/* Search Icon */}
                <span className="product-search-icon">
                  🔍
                </span>
            <input
                  ref={productSearchInputRef}
              type="text"
                  placeholder={
                    formData.product_types 
                      ? `Search ${formData.product_types === 'PH' ? 'phones' : formData.product_types === 'LT' ? 'laptops' : formData.product_types === 'TB' ? 'tablets' : 'accessories'}...`
                      : "Search products..."
                  }
              value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductSuggestions(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setShowProductSuggestions(true)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking on them
                    setTimeout(() => setShowProductSuggestions(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex(prev => 
                        prev < filteredProducts.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                    } else if (e.key === 'Enter' && highlightedIndex >= 0 && filteredProducts[highlightedIndex]) {
                      e.preventDefault();
                      const product = filteredProducts[highlightedIndex];
                      if (product.id) {
                        handleProductToggle(product.id);
                        setProductSearch('');
                        setShowProductSuggestions(false);
                        setHighlightedIndex(-1);
                      }
                    } else if (e.key === 'Escape') {
                      setShowProductSuggestions(false);
                      setHighlightedIndex(-1);
                    }
                  }}
              className="product-search-input"
                  style={{ 
                    paddingRight: productSearch ? '2.5rem' : '0.75rem',
                  }}
                  autoComplete="off"
                />
                {/* Clear Button */}
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setShowProductSuggestions(false);
                      setHighlightedIndex(-1);
                      productSearchInputRef.current?.focus();
                    }}
                    className="product-search-clear"
                    title="Clear search"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    ×
                  </button>
                )}
            </div>
              
              {/* Suggestions Dropdown */}
              {showProductSuggestions && filteredProducts.length > 0 && (
                <div className="product-suggestions">
                  {filteredProducts.map((product, index) => {
                  const isSelected = selectedProductIds.has(product.id!);
                    const isHighlighted = highlightedIndex === index;
                    const typeColors: Record<string, string> = {
                      'Phone': '#007bff',
                      'Laptop': '#28a745',
                      'Tablet': '#ffc107',
                      'Accessory': '#6c757d',
                    };
                    
                  return (
                    <div
                      key={product.id}
                      className={`product-suggestion-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => {
                        if (product.id) {
                          handleProductToggle(product.id);
                          // Keep dropdown open for multiple selections
                          setHighlightedIndex(-1);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="product-suggestion-checkbox" />
                      <div className="product-suggestion-content">
                        <div className="product-suggestion-name">
                          {product.product_name}
                        </div>
                        <div className="product-suggestion-meta">
                          {product.brand && (
                            <span className="product-suggestion-badge">
                              {product.brand}
                            </span>
                          )}
                          {product.model_series && (
                            <span className="product-suggestion-badge">
                              {product.model_series}
                            </span>
                          )}
                          {product.product_type_display && (
                            <span className="product-suggestion-badge" style={{
                              backgroundColor: typeColors[product.product_type_display] || '#6c757d',
                              color: 'white',
                            }}>
                              {product.product_type_display}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
              
              {/* No Results Message */}
              {showProductSuggestions && productSearch && filteredProducts.length === 0 && (
                <div className="product-suggestions product-suggestions-empty">
                  No products found matching "{productSearch}"
                </div>
              )}
            </div>
            
            <div className="product-selection-info">
              <div className="product-selection-count">
                Selected: {selectedProductIds.size} product(s)
              </div>
              {selectedProductIds.size > 0 && (
                <div className="selected-products">
                  {Array.from(selectedProductIds).map((productId) => {
                    const product = productsData?.find(p => p.id === productId);
                    if (!product) return null;
                    return (
                      <span key={productId} className="selected-product-tag">
                        {product.product_name}
                        <button
                          type="button"
                          onClick={() => handleProductToggle(productId)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.products && <span className="error-text">{errors.products}</span>}
            <small className="form-help">At least one product or product type must be selected.</small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={isLoading}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : promotion ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

