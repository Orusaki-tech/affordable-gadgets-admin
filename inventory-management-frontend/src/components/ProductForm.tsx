import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProductTemplate,
  Tag,
  Brand,
  ProductsService,
  ImagesService,
  TagsService,
  BrandsService,
  ProfilesService,
} from '../api/index';
import { useAuth } from '../contexts/AuthContext';

interface ProductFormProps {
  product: ProductTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    model_series: '',
    product_type: '',
    product_description: '',
    quantity: undefined as number | undefined,
    min_stock_threshold: undefined as number | undefined,
    reorder_point: undefined as number | undefined,
    is_discontinued: false,
    // SEO Fields
    meta_title: '',
    meta_description: '',
    slug: '',
    keywords: '',
    og_image: null as File | null,
    // Content Fields
    long_description: '',
    product_highlights: [] as string[],
    is_published: true,
    // Video Fields
    product_video_url: '',
    product_video_file: null as File | null,
    // Tags
    tag_ids: [] as number[],
    // Company Brand Assignment (different from product manufacturer brand)
    brand_ids: [] as number[],
    is_global: false,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: true, // Always enabled
  });

  const hasRole = (roleName: string) => {
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isInventoryManager = hasRole('IM') && !isSuperuser;

  // Debug logging (remove in production)
  useEffect(() => {
    if (adminProfile) {
      console.log('ProductForm - Admin Profile:', {
        roles: adminProfile.roles,
        roleCodes: adminProfile.roles?.map(r => r.role_code || r.name),
        isContentCreator,
        isSuperuser,
        hasProduct: !!product,
      });
    } else {
      console.log('ProductForm - Admin Profile: NOT LOADED YET');
    }
  }, [adminProfile, isContentCreator, isSuperuser, product]);

  // Prevent Content Creators from creating products
  useEffect(() => {
    if (isContentCreator && !product) {
      alert('Content Creators can only edit existing products.');
      onClose();
    }
  }, [isContentCreator, product, onClose]);

  // Fetch existing images when editing - fetch all and filter client-side
  const { data: allImagesData, refetch: refetchImages } = useQuery({
    queryKey: ['product-images-all'],
    queryFn: () => ImagesService.imagesList(1),
    enabled: !!product?.id,
  });

  // Filter images for this product
  const existingImages = useMemo(() => {
    if (!allImagesData?.results || !product?.id) return null;
    // Filter by product ID - assuming the API returns product_id in the response
    // If not, we'll need to check the actual response structure
    return {
      results: allImagesData.results.filter((img: any) => img.product === product.id),
      count: allImagesData.results.filter((img: any) => img.product === product.id).length,
    };
  }, [allImagesData, product?.id]);

  // Fetch all tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags-all'],
    queryFn: () => TagsService.tagsList(),
  });

  // Fetch all active company brands (for brand assignment)
  const { data: brandsData } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => {
      const response = await BrandsService.brandsList(1);
      return response.results || [];
    },
    enabled: !isContentCreator, // Only fetch for non-Content Creators
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || '',
        brand: product.brand || '',
        model_series: product.model_series || '',
        product_type: product.product_type || '',
        product_description: product.product_description || '',
        quantity: undefined, // Quantity is for InventoryUnit, not ProductTemplate
        min_stock_threshold: (product as any).min_stock_threshold,
        reorder_point: (product as any).reorder_point,
        is_discontinued: (product as any).is_discontinued || false,
        // SEO Fields
        meta_title: (product as any).meta_title || '',
        meta_description: (product as any).meta_description || '',
        slug: (product as any).slug || '',
        keywords: (product as any).keywords || '',
        og_image: null, // File upload handled separately
        // Content Fields
        long_description: (product as any).long_description || '',
        product_highlights: (product as any).product_highlights || [],
        is_published: (product as any).is_published !== false,
        // Video Fields
        product_video_url: (product as any).product_video_url || '',
        product_video_file: null, // File upload handled separately
        // Tags
        tag_ids: product.tags?.map((tag: Tag) => tag.id || 0).filter((id): id is number => id !== 0) || [],
        // Company Brand Assignment
        brand_ids: (() => {
          // brands is typed as string but may be an array or string at runtime
          const brandsValue = product.brands as any;
          if (typeof brandsValue === 'string') {
            try {
              const parsed = JSON.parse(brandsValue);
              return Array.isArray(parsed) ? parsed.map((b: any) => b.id || 0).filter((id: any): id is number => id !== 0) : [];
            } catch {
              return [];
            }
          }
          if (Array.isArray(brandsValue)) {
            return brandsValue.map((b: any) => b.id || 0).filter((id: any): id is number => id !== 0);
          }
          return [];
        })(),
        is_global: (product as any).is_global || false,
      });
      
      // Auto-populate brand_ids if product has no brands and admin has brands
      const productBrandIds = (() => {
        // brands is typed as string but may be an array or string at runtime
        const brandsValue = product.brands as any;
        if (typeof brandsValue === 'string') {
          try {
            const parsed = JSON.parse(brandsValue);
            return Array.isArray(parsed) ? parsed.map((b: any) => b.id || 0).filter((id: any): id is number => id !== 0) : [];
          } catch {
            return [];
          }
        }
        if (Array.isArray(brandsValue)) {
          return brandsValue.map((b: any) => b.id || 0).filter((id: any): id is number => id !== 0);
        }
        return [];
      })();
      if (productBrandIds.length === 0 && adminProfile && !isContentCreator) {
        const adminBrandIds = (adminProfile as any)?.brands?.map((b: Brand) => b.id).filter((id: number | undefined): id is number => id !== undefined) || [];
        if (adminBrandIds.length > 0) {
          setFormData(prev => ({
            ...prev,
            brand_ids: adminBrandIds,
          }));
        }
      }
      
      // Clear preview images when editing existing product
      previewImages.forEach(url => URL.revokeObjectURL(url));
      setPreviewImages([]);
      setSelectedImages([]);
    } else {
      setFormData({
        product_name: '',
        brand: '',
        model_series: '',
        product_type: '',
        product_description: '',
        quantity: undefined,
        min_stock_threshold: undefined,
        reorder_point: undefined,
        is_discontinued: false,
        // SEO Fields
        meta_title: '',
        meta_description: '',
        slug: '',
        keywords: '',
        og_image: null,
        // Content Fields
        long_description: '',
        product_highlights: [],
        is_published: true,
        // Video Fields
        product_video_url: '',
        product_video_file: null,
        // Tags
        tag_ids: [],
        // Company Brand Assignment
        brand_ids: [],
        is_global: false,
      });
      
      // For new products, auto-populate brand_ids from admin profile
      if (adminProfile && !isContentCreator) {
        const adminBrandIds = (adminProfile as any)?.brands?.map((b: Brand) => b.id).filter((id: number | undefined): id is number => id !== undefined) || [];
        if (adminBrandIds.length > 0) {
          setFormData(prev => ({
            ...prev,
            brand_ids: adminBrandIds,
          }));
        }
      }
      
      // Clear preview images when creating new product
      previewImages.forEach(url => URL.revokeObjectURL(url));
      setPreviewImages([]);
      setSelectedImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, adminProfile, isContentCreator]);

  // Auto-generate slug from product_name
  useEffect(() => {
    if (!product && formData.product_name && !formData.slug) {
      const generatedSlug = formData.product_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.product_name, product, formData.slug]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all preview URLs when component unmounts
      setPreviewImages(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
    };
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      ProductsService.productsCreate(data),
    onSuccess: async (createdProduct) => {
      // Invalidate both query keys to ensure UnitForm sees the new product
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-all'] });
      // Refetch to show the newly created product immediately
      queryClient.refetchQueries({ queryKey: ['products-all'] });
      
      // Upload images if any were selected during creation
      if (createdProduct?.id && selectedImages.length > 0) {
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            await ImagesService.imagesCreate({
              product: createdProduct.id,
              image: selectedImages[i],
              is_primary: i === 0, // First image is primary
            });
          }
          // Clear selected images and previews after successful upload
          previewImages.forEach(url => URL.revokeObjectURL(url));
          setSelectedImages([]);
          setPreviewImages([]);
        } catch (err: any) {
          console.error('Error uploading images:', err);
          alert(`Product created, but some images failed to upload: ${err.message || 'Unknown error'}`);
        }
      }
      
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      // Extract error message from API response
      let errorMessage = 'Unknown error';
      if (err.body) {
        // DRF validation errors are usually in err.body
        if (typeof err.body === 'object') {
          const errorDetails = Object.entries(err.body)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errorDetails || JSON.stringify(err.body);
        } else {
          errorMessage = String(err.body);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Failed to create product: ${errorMessage}`);
      console.error('Product creation error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!product?.id) throw new Error('Product ID is required');
      return ProductsService.productsPartialUpdate(product.id, data);
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      // Extract error message from API response
      let errorMessage = 'Unknown error';
      if (err.body) {
        // DRF validation errors are usually in err.body
        if (typeof err.body === 'object') {
          const errorDetails = Object.entries(err.body)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errorDetails || JSON.stringify(err.body);
        } else {
          errorMessage = String(err.body);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`Failed to update product: ${errorMessage}`);
      console.error('Product update error:', err);
    },
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!product?.id) throw new Error('Product ID required');
      return ImagesService.imagesCreate({
        product: product.id,
        image: file,
        is_primary: (existingImages?.results?.length || 0) === 0, // First image is primary
      });
    },
    onSuccess: () => {
      refetchImages();
      setSelectedImages([]);
    },
    onError: (err: any) => {
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
    },
  });

  // Set primary image mutation
  const setPrimaryImageMutation = useMutation({
    mutationFn: async ({ imageId, isPrimary }: { imageId: number; isPrimary: boolean }) => {
      return ImagesService.imagesPartialUpdate(imageId, {
        is_primary: isPrimary,
      });
    },
    onSuccess: () => {
      refetchImages();
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return ImagesService.imagesDestroy(imageId);
    },
    onSuccess: () => {
      refetchImages();
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      
      // Create preview URLs for immediate display
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    // Revoke preview URL to free memory
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (!product?.id) {
      alert('Please save the product first before uploading images');
      return;
    }
    
    for (const file of selectedImages) {
      await uploadImageMutation.mutateAsync(file);
    }
    // Clear previews after upload
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
  };

  const handleSetPrimary = (imageId: number) => {
    setPrimaryImageMutation.mutate({ imageId, isPrimary: true });
  };

  const handleDeleteImage = (imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  // Calculate SEO score
  const seoScore = useMemo(() => {
    let score = 0;
    const total = 8;
    
    if (formData.meta_title) score++;
    if (formData.meta_description) score++;
    if (formData.slug) score++;
    if (formData.og_image || (product as any)?.og_image_url) score++;
    if (formData.product_description) score++;
    if (existingImages?.results && existingImages.results.length > 0) {
      // Check if at least one image has alt text
      const hasAltText = existingImages.results.some((img: any) => img.alt_text && img.alt_text.trim());
      if (hasAltText) score++;
    }
    if (formData.product_highlights && formData.product_highlights.length > 0) score++;
    if (formData.keywords) score++;
    
    return Math.round((score / total) * 100);
  }, [formData, existingImages, product]);

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      product_highlights: [...prev.product_highlights, ''],
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_highlights: prev.product_highlights.filter((_, i) => i !== index),
    }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      product_highlights: prev.product_highlights.map((h, i) => i === index ? value : h),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Content Creators, only include content fields (not inventory fields)
    if (isContentCreator && product?.id) {
      // Content Creators should use the update_content endpoint
      const contentData: any = {
        product_description: formData.product_description || undefined,
        // SEO Fields
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        slug: formData.slug || undefined,
        keywords: formData.keywords || undefined,
        // Content Fields
        long_description: formData.long_description || undefined,
        product_highlights: formData.product_highlights.filter(h => h.trim()).length > 0 ? formData.product_highlights.filter(h => h.trim()) : undefined,
        is_published: formData.is_published,
        // Video Fields
        product_video_url: formData.product_video_url || undefined,
        // Tags
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
      };
      
      // Use the update_content endpoint for Content Creators
      if (product.id) {
        ProductsService.productsUpdateContentPartialUpdate(product.id, contentData)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['products-all'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onSuccess();
          })
          .catch((err) => {
            alert(`Failed to update product content: ${err.message || 'Unknown error'}`);
          });
      }
      return;
    }
    
    // For non-Content Creators or when creating, include all fields
    const submitData: any = {
      product_name: formData.product_name,
      product_type: formData.product_type,
      brand: formData.brand || undefined,
      model_series: formData.model_series || undefined,
      product_description: formData.product_description || undefined,
      min_stock_threshold: formData.min_stock_threshold,
      reorder_point: formData.reorder_point,
      is_discontinued: formData.is_discontinued,
      // SEO Fields
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      slug: formData.slug || undefined,
      keywords: formData.keywords || undefined,
      // Content Fields
      long_description: formData.long_description || undefined,
      product_highlights: formData.product_highlights.filter(h => h.trim()).length > 0 ? formData.product_highlights.filter(h => h.trim()) : undefined,
      is_published: formData.is_published,
      // Video Fields
      product_video_url: formData.product_video_url || undefined,
      // Tags
      tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
      // Company Brand Assignment
      brand_ids: formData.brand_ids.length > 0 ? formData.brand_ids : undefined,
      is_global: formData.is_global,
    };

    // Handle OG image upload separately if file is selected
    if (formData.og_image) {
      // For now, we'll need to handle file uploads separately
      // This would require a multipart/form-data request
      // For simplicity, we'll add it to the submitData as a note
      console.warn('OG image file upload needs to be handled separately via multipart/form-data');
    }

    if (product?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending || isLoadingProfile;

  // Show loading state while checking role
  if (isLoadingProfile) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading...</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading user permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isContentCreator ? 'Edit Product Content' : (product ? 'Edit Product' : 'Create Product')}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {isContentCreator && (
          <div
            style={{
              background: '#eef5ff',
              border: '1px solid #cfe0ff',
              color: '#1f3b73',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              margin: '0.75rem 1rem 0',
              fontSize: '0.9rem',
            }}
          >
            Content Creators can edit content-only fields. Inventory and pricing fields are read-only.
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-group">
            <label htmlFor="product_name">
              Product Name <span className="required">*</span>
            </label>
            <input
              id="product_name"
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              disabled={isLoading || isContentCreator}
              readOnly={isContentCreator}
              style={isContentCreator ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">
              Product Manufacturer Brand <span className="required">*</span>
            </label>
            <input
              id="brand"
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              disabled={isLoading || isContentCreator}
              readOnly={isContentCreator}
              style={isContentCreator ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
              placeholder="e.g., Apple, Samsung, Dell"
            />
            <small className="form-help">
              The manufacturer brand of the product (e.g., Apple, Samsung, Dell)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="model_series">Model/Series</label>
            <input
              id="model_series"
              type="text"
              value={formData.model_series}
              onChange={(e) => setFormData({ ...formData, model_series: e.target.value })}
              disabled={isLoading || isContentCreator}
              readOnly={isContentCreator}
              style={isContentCreator ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product_type">
              Product Type <span className="required">*</span>
            </label>
            <select
              id="product_type"
              value={formData.product_type}
              onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
              required
              disabled={isLoading || isContentCreator}
              style={isContentCreator ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
            >
              <option value="">Select type</option>
              <option value="PH">Phone (PH)</option>
              <option value="LT">Laptop (LT)</option>
              <option value="TB">Tablet (TB)</option>
              <option value="AC">Accessory (AC)</option>
            </select>
          </div>

          {/* Quantity field - only shown for Accessories and not for Content Creators or Inventory Managers */}
          {formData.product_type === 'AC' && !isContentCreator && !isInventoryManager && (
            <div className="form-group">
              <label htmlFor="quantity">
                Default Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  quantity: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                disabled={isLoading}
                placeholder="Enter default quantity (e.g., 10)"
              />
              <small className="form-help">
                Note: This is informational. Actual quantity will be set when creating inventory units for this product.
              </small>
            </div>
          )}

          {/* Description - Hidden for Inventory Managers */}
          {!isInventoryManager && (
            <div className="form-group">
              <label htmlFor="product_description">Description</label>
              <textarea
                id="product_description"
                value={formData.product_description}
                onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                rows={4}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Company Brand Assignment - Now visible to all roles except Content Creators */}
          {!isContentCreator && (
            <div className="form-section-divider">
              <h3>Company Brand Assignment</h3>
              <p className="form-description">
                {isInventoryManager 
                  ? "Products you create will automatically be associated with your assigned brand(s) if not specified below. This is different from the product manufacturer brand above."
                  : "Select which company brand e-commerce sites this product should appear on. This is different from the product manufacturer brand above."}
              </p>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_global}
                    onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                    disabled={isLoading}
                  />
                  <span>Available on all company brand sites (Global)</span>
                </label>
                <small className="form-help">
                  If checked, product will appear on all company brand e-commerce sites regardless of selection below.
                </small>
              </div>

              {!formData.is_global && (
                <div className="form-group">
                  <label className="form-label">Select Company Brands</label>
                  <div className="brand-selection-grid">
                    {brandsData && brandsData.length > 0 ? (
                      brandsData.map((brand: Brand) => (
                        <label
                          key={brand.id}
                          className={`brand-selection-card ${formData.brand_ids.includes(brand.id || 0) ? 'brand-selection-card-selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.brand_ids.includes(brand.id || 0)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  brand_ids: [...prev.brand_ids, brand.id || 0],
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  brand_ids: prev.brand_ids.filter(id => id !== (brand.id || 0)),
                                }));
                              }
                            }}
                            disabled={isLoading}
                          />
                          <span>{brand.name} ({brand.code})</span>
                        </label>
                      ))
                    ) : (
                      <small className="form-help">
                        No company brands available. Create brands in the Brands management page.
                      </small>
                    )}
                  </div>
                  <small className="form-help">
                    Select which company brand e-commerce sites should display this product. Leave empty to make it available to all brands.
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Inventory Management Fields - Hidden for Content Creators */}
          {!isContentCreator && (
            <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#2c3e50' }}>Inventory Management</h3>
              
              <div className="form-group">
                <label htmlFor="min_stock_threshold">Minimum Stock Threshold</label>
                <input
                  id="min_stock_threshold"
                  type="number"
                  min="0"
                  value={formData.min_stock_threshold || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    min_stock_threshold: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="e.g., 5"
                  disabled={isLoading}
                />
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Alert when available units fall below this number
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="reorder_point">Reorder Point</label>
                <input
                  id="reorder_point"
                  type="number"
                  min="0"
                  value={formData.reorder_point || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    reorder_point: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="e.g., 10"
                  disabled={isLoading}
                />
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Recommended stock level for reordering
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="is_discontinued" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    id="is_discontinued"
                    type="checkbox"
                    checked={formData.is_discontinued}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      is_discontinued: e.target.checked 
                    })}
                    disabled={isLoading}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Mark as Discontinued</span>
                </label>
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block', marginLeft: '1.5rem' }}>
                  Discontinued products won't trigger out-of-stock alerts
                </small>
              </div>
            </div>
          )}

          {/* Image Upload Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <div className="form-group" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
            <label>Product Images</label>
            
            {/* Preview selected images (for creation) */}
            {(previewImages.length > 0 || selectedImages.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {previewImages.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    {index === 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        right: '4px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem' 
                      }}>
                        Primary
                      </div>
                    )}
                    <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isLoading}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Existing Images (only when editing) */}
            {product?.id && existingImages && existingImages.results && existingImages.results.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {existingImages.results.map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                      <img 
                        src={img.image_url || img.image} 
                        alt="Product" 
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      />
                      {img.is_primary && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          right: '4px', 
                          backgroundColor: '#28a745', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem' 
                        }}>
                          Primary
                        </div>
                      )}
                      <div style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                        {!img.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img.id)}
                            disabled={setPrimaryImageMutation.isPending}
                            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deleteImageMutation.isPending}
                          style={{ fontSize: '0.75rem', padding: '0.25rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Upload New Images */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={isLoading}
              />
              {selectedImages.length > 0 && !product?.id && (
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {selectedImages.length} image(s) selected. They will be uploaded when you create the product.
                </div>
              )}
              {selectedImages.length > 0 && product?.id && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {selectedImages.length} image(s) selected
                  </span>
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploadImageMutation.isPending}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#667eea', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Images'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImages([]);
                      previewImages.forEach(url => URL.revokeObjectURL(url));
                      setPreviewImages([]);
                    }}
                    disabled={uploadImageMutation.isPending}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
              {product?.id 
                ? 'Upload images for this product. The first image will be set as primary.' 
                : 'Select images to upload. They will be attached when you create the product. The first image will be set as primary.'}
            </small>
          </div>
          )}

          {/* SEO Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <>
          <div className="form-section-divider" style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-20)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--md-on-surface)' }}>SEO Optimization</h3>
            <div className="seo-scorecard" style={{
              backgroundColor: 'var(--md-surface-container-low)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--md-outline-variant)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <div className="seo-score-display" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: '2px solid var(--md-outline-variant)',
              }}>
                <span className="seo-score-value" style={{
                  fontSize: 'var(--font-size-32)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: seoScore >= 75 ? 'var(--md-tertiary)' : seoScore >= 50 ? 'var(--md-secondary)' : 'var(--md-error)',
                  lineHeight: 1,
                }}>{seoScore}%</span>
                <span className="seo-score-label" style={{
                  fontSize: 'var(--font-size-14)',
                  color: 'var(--md-on-surface-variant)',
                  marginTop: 'var(--spacing-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>SEO Complete</span>
              </div>
              <div className="seo-checklist" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-sm)',
              }}>
                <div className={`seo-item ${formData.meta_title ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: formData.meta_title ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${formData.meta_title ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: formData.meta_title ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{formData.meta_title ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: formData.meta_title ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Meta Title {formData.meta_title && `(${formData.meta_title.length}/60)`}</span>
                </div>
                <div className={`seo-item ${formData.meta_description ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: formData.meta_description ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${formData.meta_description ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: formData.meta_description ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{formData.meta_description ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: formData.meta_description ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Meta Description {formData.meta_description && `(${formData.meta_description.length}/160)`}</span>
                </div>
                <div className={`seo-item ${formData.slug ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: formData.slug ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${formData.slug ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: formData.slug ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{formData.slug ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: formData.slug ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>URL Slug</span>
                </div>
                <div className={`seo-item ${formData.keywords ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: formData.keywords ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${formData.keywords ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: formData.keywords ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{formData.keywords ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: formData.keywords ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Keywords</span>
                </div>
                <div className={`seo-item ${formData.product_description ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: formData.product_description ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${formData.product_description ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: formData.product_description ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{formData.product_description ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: formData.product_description ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Product Description</span>
                </div>
                <div className={`seo-item ${existingImages?.results && existingImages.results.length > 0 ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: (existingImages?.results && existingImages.results.length > 0) ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${(existingImages?.results && existingImages.results.length > 0) ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: (existingImages?.results && existingImages.results.length > 0) ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{(existingImages?.results && existingImages.results.length > 0) ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: (existingImages?.results && existingImages.results.length > 0) ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Product Images</span>
                </div>
                <div className={`seo-item ${formData.product_highlights && formData.product_highlights.length > 0 ? 'complete' : 'incomplete'}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: (formData.product_highlights && formData.product_highlights.length > 0) ? 'var(--md-tertiary-container)' : 'var(--md-surface-container)',
                  border: `1px solid ${(formData.product_highlights && formData.product_highlights.length > 0) ? 'var(--md-tertiary)' : 'var(--md-outline-variant)'}`,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-18)',
                    color: (formData.product_highlights && formData.product_highlights.length > 0) ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}>{(formData.product_highlights && formData.product_highlights.length > 0) ? '✓' : '○'}</span>
                  <span style={{
                    fontSize: 'var(--font-size-13)',
                    color: (formData.product_highlights && formData.product_highlights.length > 0) ? 'var(--md-on-tertiary-container)' : 'var(--md-on-surface-variant)',
                  }}>Product Highlights</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="meta_title">
              Meta Title <span className="required">*</span>
              <span className="char-count" style={{ float: 'right', fontWeight: 'normal', color: formData.meta_title.length > 60 ? '#dc3545' : '#666' }}>
                {formData.meta_title.length}/60
              </span>
            </label>
            <input
              id="meta_title"
              type="text"
              maxLength={60}
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              disabled={isLoading}
              placeholder="e.g., iPhone 15 Pro Max 256GB - Titanium"
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Recommended: 50-60 characters. Include brand and model.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="meta_description">
              Meta Description
              <span className="char-count" style={{ float: 'right', fontWeight: 'normal', color: formData.meta_description.length > 160 ? '#dc3545' : '#666' }}>
                {formData.meta_description.length}/160
              </span>
            </label>
            <textarea
              id="meta_description"
              maxLength={160}
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              disabled={isLoading}
              placeholder="Compelling product description for search results (150-160 chars recommended)"
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Recommended: 150-160 characters. Include key benefits and call-to-action.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="slug">
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              disabled={isLoading}
              placeholder="auto-generated-from-product-name"
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              URL-friendly version of product name. Auto-generated if left empty.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="keywords">Keywords</label>
            <input
              id="keywords"
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              disabled={isLoading}
              placeholder="iphone, smartphone, apple, 256gb, titanium"
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Comma-separated keywords for SEO.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="og_image">Open Graph Image (Social Sharing)</label>
            <input
              id="og_image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFormData(prev => ({ ...prev, og_image: file }));
              }}
              disabled={isLoading}
            />
            {product && (product as any).og_image_url && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={(product as any).og_image_url} alt="Open Graph preview" style={{ maxWidth: '200px', borderRadius: '4px' }} />
              </div>
            )}
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Image that appears when sharing on social media (1200x630px recommended).
            </small>
          </div>
          </>
          )}

          {/* Content Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <>
          <div className="form-section-divider">
            <h3>Content</h3>
          </div>

          <div className="form-group">
            <label htmlFor="long_description">Long Description</label>
            <textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={6}
              disabled={isLoading}
              placeholder="Detailed product description with features, specifications, and benefits..."
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Extended product description for detailed content.
            </small>
          </div>

          <div className="form-group">
            <label>Product Highlights</label>
            {formData.product_highlights.map((highlight, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                  placeholder="Enter highlight feature..."
                  disabled={isLoading}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  disabled={isLoading}
                  style={{ padding: '0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddHighlight}
              disabled={isLoading}
              style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Highlight
            </button>
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Key features and benefits as bullet points.
            </small>
          </div>
          </>
          )}

          {/* Video Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <>
          <div className="form-section-divider">
            <h3>Product Video</h3>
          </div>

          <div className="form-group">
            <label htmlFor="product_video_url">Video URL</label>
            <input
              id="product_video_url"
              type="url"
              value={formData.product_video_url}
              onChange={(e) => setFormData({ ...formData, product_video_url: e.target.value })}
              disabled={isLoading}
              placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Link to product video (YouTube, Vimeo, Google Drive, etc.).
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="product_video_file">Upload Video File</label>
            <input
              id="product_video_file"
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFormData(prev => ({ ...prev, product_video_file: file }));
              }}
              disabled={isLoading}
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Upload a product video file directly (max 100MB).
            </small>
          </div>
          </>
          )}

          {/* Tags Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <>
          <div className="form-section-divider">
            <h3>Tags</h3>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Product Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {tagsData?.map((tag: Tag) => (
                <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.tag_ids.includes(tag.id || 0)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          tag_ids: [...prev.tag_ids, tag.id || 0],
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          tag_ids: prev.tag_ids.filter(id => id !== (tag.id || 0)),
                        }));
                      }
                    }}
                    disabled={isLoading}
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
            {(!tagsData || tagsData.length === 0) && (
              <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                No tags available. Create tags in the Tags management page.
              </small>
            )}
          </div>
          </>
          )}

          {/* Publishing Section - Hidden for Inventory Managers */}
          {!isInventoryManager && (
          <>
          <div className="form-section-divider">
            <h3>Publishing</h3>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                disabled={isLoading}
              />
              <span>Published (visible on e-commerce site)</span>
            </label>
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Uncheck to save as draft. Draft products are not visible on the e-commerce site.
            </small>
          </div>
          </>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

