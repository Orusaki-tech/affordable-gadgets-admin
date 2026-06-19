import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProductTemplate,
  Tag,
  Brand,
  ProductsService,
  ImagesService,
  TagsService,
  ArticlesService,
} from '../api/index';
import { useAuth } from '../contexts/AuthContext';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { useBrandsList } from '../hooks/useBrandsList';
import { queryKeys } from '../hooks/queryKeys';
import { OpenAPI } from '../api/core/OpenAPI';
import { RichTextEditor } from './RichTextEditor';
import ProductVariantEditor from './ProductVariantEditor';

interface VariantFormData {
  storage_gb?: number | null;
  ram_gb?: number | null;
  default_selling_price: string;
  default_cost_of_unit: string;
  is_active: boolean;
}

interface ProductFormProps {
  product: ProductTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
  /** When set from Product guides hub: only article fields + save article only */
  variant?: 'full' | 'buyingGuide';
  /** When editing a specific article row (multi-article). Omit for primary / legacy single guide. */
  editingArticleId?: number | null;
}

const ARTICLE_CATEGORIES = [
  { value: 'buying_guide', label: 'Buying Guide' },
  { value: 'history_guide', label: 'History Guide' },
  { value: 'informational_guide', label: 'Informational Guide' },
  { value: 'tech_tip', label: 'Tech Tip' },
  { value: 'news', label: 'News' },
  { value: 'general', label: 'General' },
] as const;

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  onSuccess,
  variant = 'full',
  editingArticleId = null,
}) => {
  useAuth(); // useAdminProfile uses auth internally
  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    model_series: '',
    product_type: '',
    product_description: '',
    quantity: undefined as number | undefined,
    min_stock_threshold: undefined as number | undefined,
    reorder_point: undefined as number | undefined,
    default_selling_price: '' as string,
    storage_gb: undefined as number | undefined,
    ram_gb: undefined as number | undefined,
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
    // Buying guide / SEO article (ProductArticle)
    article_headline: '',
    article_slug: '',
    article_category: 'buying_guide',
    article_is_primary: false,
    article_id: null as number | null,
    article_seo_title: '',
    article_seo_description: '',
    article_body: '',
    article_is_published: false,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const selectedImagesRef = useRef<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const previewImagesRef = useRef<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [pendingVariants, setPendingVariants] = useState<VariantFormData[]>([]);
  const queryClient = useQueryClient();

  const { data: adminProfile, isLoading: isLoadingProfile } = useAdminProfile();

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

  // Keep refs in sync so callbacks always see the latest values
  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);
  useEffect(() => {
    previewImagesRef.current = previewImages;
  }, [previewImages]);

  const productId = product?.id;

  // Fetch existing images for this product via product detail (not global /images/ page 1)
  const { data: productDetail, refetch: refetchImages } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => {
      if (productId == null) throw new Error('Product ID required');
      return ProductsService.productsRetrieve(productId);
    },
    enabled: productId != null && (variant === 'full' || variant === 'buyingGuide'),
  });

  const existingImages = useMemo(() => {
    const images = (productDetail as { images?: Array<Record<string, unknown>> } | undefined)?.images;
    if (!images || !Array.isArray(images)) return null;
    return {
      results: images.map((img) => ({
        id: img.id as number,
        image_url: (img.image_url || img.thumbnail_url) as string,
        is_primary: Boolean(img.is_primary),
        alt_text: img.alt_text as string | undefined,
      })),
      count: images.length,
    };
  }, [productDetail]);

  // Fetch all tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags-all'],
    queryFn: () => TagsService.tagsList(),
  });

  const { data: brandsData } = useBrandsList({ enabled: !isContentCreator });

  useEffect(() => {
    if (product) {
      setIsSlugManuallyEdited(true);
      setFormData({
        product_name: product.product_name || '',
        brand: product.brand || '',
        model_series: product.model_series || '',
        product_type: product.product_type || '',
        product_description: product.product_description || '',
        quantity: undefined, // Quantity is for InventoryUnit, not ProductTemplate
        min_stock_threshold: (product as any).min_stock_threshold,
        reorder_point: (product as any).reorder_point,
        default_selling_price:
          (product as any).default_selling_price != null && (product as any).default_selling_price !== ''
            ? String((product as any).default_selling_price)
            : '',
        storage_gb: (product as any).storage_gb ?? undefined,
        ram_gb: (product as any).ram_gb ?? undefined,
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
        article_headline: '',
        article_slug: '',
        article_category: 'buying_guide',
        article_is_primary: false,
        article_id: editingArticleId,
        article_seo_title: '',
        article_seo_description: '',
        article_body: '',
        article_is_published: false,
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
      setIsSlugManuallyEdited(false);
      setFormData({
        product_name: '',
        brand: '',
        model_series: '',
        product_type: '',
        product_description: '',
        quantity: undefined,
        min_stock_threshold: undefined,
        reorder_point: undefined,
        default_selling_price: '',
        storage_gb: undefined,
        ram_gb: undefined,
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
        article_headline: '',
        article_slug: '',
        article_category: 'buying_guide',
        article_is_primary: false,
        article_id: null,
        article_seo_title: '',
        article_seo_description: '',
        article_body: '',
        article_is_published: false,
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
  }, [product, adminProfile, isContentCreator, editingArticleId]);

  useEffect(() => {
    if (!product || variant !== 'buyingGuide') return;
    const source = (productDetail as any) ?? product;
    const articles = (source as { articles?: Array<Record<string, unknown>> }).articles;
    let article: Record<string, unknown> | null = null;
    if (editingArticleId && Array.isArray(articles)) {
      article = articles.find((row) => row.id === editingArticleId) ?? null;
    } else if ((source as { article?: Record<string, unknown> }).article) {
      article = (source as { article?: Record<string, unknown> }).article ?? null;
    } else if (Array.isArray(articles) && articles.length > 0) {
      article = articles.find((row) => row.is_primary) ?? articles[0];
    }
    if (!article) return;
    setFormData((prev) => ({
      ...prev,
      article_id: (article!.id as number) ?? null,
      article_headline: String(article!.headline || ''),
      article_slug: String(article!.slug || ''),
      article_category: String(article!.category || 'buying_guide'),
      article_is_primary: Boolean(article!.is_primary),
      article_seo_title: String(article!.seo_title || ''),
      article_seo_description: String(article!.seo_description || ''),
      article_body: String(article!.body || ''),
      article_is_published: Boolean(article!.is_published),
    }));
  }, [product, productDetail, variant, editingArticleId]);

  // Auto-generate slug from structured fields (brand + model_series + product_type)
  useEffect(() => {
    if (!product && !isSlugManuallyEdited) {
      const brand = formData.brand?.trim();
      const modelSeries = formData.model_series?.trim();
      const productType = formData.product_type?.trim();
      const productName = formData.product_name?.trim();

      const isMissing = (v?: string) => !v || v.trim() === "" || v.trim().toUpperCase() === "N/A";

      const source = !isMissing(brand) && !isMissing(modelSeries) && !isMissing(productName)
        ? [brand, modelSeries, productName, productType].filter(Boolean).join('-')
        : productName;

      if (!source) return;

      const generatedSlug = source
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (generatedSlug && generatedSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
      }
    }
  }, [
    formData.brand,
    formData.model_series,
    formData.product_type,
    formData.product_name,
    formData.slug,
    product,
    isSlugManuallyEdited,
  ]);

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
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAll() });
      // Refetch to show the newly created product immediately
      queryClient.refetchQueries({ queryKey: queryKeys.productsAll() });
      
      // Upload images if any were selected during creation
      const filesToUpload = selectedImagesRef.current;
      const previewsToClean = previewImagesRef.current;
      if (createdProduct?.id && filesToUpload.length > 0) {
        try {
          await ProductsService.productsImagesUploadCreate(createdProduct.id, {
            images: filesToUpload,
            alt_text: `${createdProduct.product_name || formData.product_name} product image`,
            make_primary: true,
          } as any);
          // Clear selected images and previews after successful upload
          previewsToClean.forEach(url => URL.revokeObjectURL(url));
          setSelectedImages([]);
          setPreviewImages([]);
        } catch (err: any) {
          console.error('Error uploading images:', err);
          alert(`Product created, but images failed to upload: ${err.message || 'Unknown error'}`);
        }
      }
      
      // Save pending variants if any were added during creation
      if (createdProduct?.id && pendingVariants.length > 0) {
        try {
          const token = localStorage.getItem('auth_token');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Token ${token}`;
          const baseUrl = OpenAPI.BASE || '';
          const variantErrors: string[] = [];
          for (let i = 0; i < pendingVariants.length; i++) {
            const v = pendingVariants[i];
            if (!v.default_selling_price || parseFloat(v.default_selling_price) <= 0) {
              variantErrors.push(`Variant ${i + 1}: selling price is required`);
              continue;
            }
            const res = await fetch(`${baseUrl}/variants/`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                product_id: createdProduct.id,
                storage_gb: v.storage_gb ?? null,
                ram_gb: v.ram_gb ?? null,
                default_selling_price: v.default_selling_price,
                default_cost_of_unit: v.default_cost_of_unit || '0',
                is_active: v.is_active,
              }),
            });
            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              variantErrors.push(`Variant ${i + 1}: ${JSON.stringify(body)}`);
            }
          }
          setPendingVariants([]);
          if (variantErrors.length > 0) {
            alert(`Product created, but some variants failed to save:\n${variantErrors.join('\n')}`);
          }
        } catch (err: any) {
          console.error('Error saving variants:', err);
          alert(`Product created, but variants failed to save: ${err.message || 'Unknown error'}`);
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
      queryClient.invalidateQueries({ queryKey: queryKeys.productsAll() });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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

  const uploadProductImages = async (productId: number, files: File[], makePrimary: boolean) => {
    setIsUploadingImages(true);
    try {
      await ProductsService.productsImagesUploadCreate(productId, {
        images: files,
        alt_text: `${formData.product_name || product?.product_name || ''} product image`,
        make_primary: makePrimary,
      } as any);
      await refetchImages();
      previewImagesRef.current.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setPreviewImages([]);
    } finally {
      setIsUploadingImages(false);
    }
  };

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
    if (selectedImages.length === 0) {
      return;
    }

    const hasExisting = (existingImages?.results?.length || 0) > 0;
    try {
      await uploadProductImages(product.id, selectedImages, !hasExisting);
    } catch (err: any) {
      alert(`Failed to upload images: ${err.message || 'Unknown error'}`);
    }
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

  const buildArticleNested = () => ({
    slug: formData.article_slug.trim() || undefined,
    category: formData.article_category,
    headline: formData.article_headline.trim() || undefined,
    seo_title: formData.article_seo_title.trim() || undefined,
    seo_description: formData.article_seo_description.trim() || undefined,
    body: formData.article_body.trim() || undefined,
    is_published: formData.article_is_published,
    is_primary: formData.article_is_primary,
  });

  const saveBuyingGuideArticle = async () => {
    if (!product?.id) return;
    const payload = {
      ...buildArticleNested(),
      product_id: product.id,
    };
    if (formData.article_id) {
      await ArticlesService.articlesPartialUpdate(formData.article_id, payload as any);
      return;
    }
    await ArticlesService.articlesCreate(payload as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (variant === 'buyingGuide' && product?.id) {
      if (isContentCreator) {
        saveBuyingGuideArticle()
          .then(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productsAll() });
            onSuccess();
          })
          .catch((err) => {
            console.error(err);
            alert('Failed to save buying guide.');
          });
        return;
      }
      const articlePayload = { article: buildArticleNested() };
      if (isInventoryManager || isSuperuser) {
        updateMutation.mutate(articlePayload as any);
        return;
      }
      saveBuyingGuideArticle()
        .then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.productsAll() });
          onSuccess();
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to save buying guide.');
        });
      return;
    }
    
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
        // Tags — always send the array so PATCH can clear tags (omitting the field leaves them unchanged)
        tag_ids: formData.tag_ids,
        article: buildArticleNested(),
      };
      
      // Use the update_content endpoint for Content Creators
      if (product.id) {
        ProductsService.productsUpdateContentPartialUpdate(product.id, contentData)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.productsAll() });
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
      storage_gb: formData.storage_gb ?? null,
      ram_gb: formData.ram_gb ?? null,
      default_selling_price: formData.default_selling_price?.trim()
        ? formData.default_selling_price.trim()
        : null,
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
      // Company Brand Assignment
      brand_ids: formData.brand_ids.length > 0 ? formData.brand_ids : undefined,
      is_global: formData.is_global,
    };

    if (product?.id && (isInventoryManager || isSuperuser)) {
      submitData.article = buildArticleNested();
    }

    // Only users who can see the tags UI should send tag_ids (IM cannot edit tags)
    if (!isInventoryManager) {
      submitData.tag_ids = formData.tag_ids;
    }

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

  const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingImages || isLoadingProfile;

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

  if (variant === 'buyingGuide') {
    if (!product?.id) {
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buying guide</h2>
              <button type="button" className="modal-close" onClick={onClose}>
                ×
              </button>
            </div>
            <p style={{ padding: '1rem' }}>No product selected.</p>
          </div>
        </div>
      );
    }
    if (!(isContentCreator || isInventoryManager || isSuperuser)) {
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buying guide</h2>
              <button type="button" className="modal-close" onClick={onClose}>
                ×
              </button>
            </div>
            <p style={{ padding: '1rem' }}>You do not have permission to edit buying guides.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Edit buying guide</h2>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.75rem 1rem 0', lineHeight: 1.45 }}>
            <strong>{product.product_name}</strong>
            {(product as { slug?: string }).slug ? (
              <>
                {' '}
                · Live at <code>/products/{(product as { slug?: string }).slug}/blog/{formData.article_slug || '&lt;slug&gt;'}</code>
              </>
            ) : null}
          </p>

          <form onSubmit={handleSubmit} className="form-section">
            <div className="form-section-divider" id="buying-guide">
              <h3>Guide content</h3>
            </div>

            <div className="form-group">
              <label htmlFor="article_slug_bg">Article slug</label>
              <input
                id="article_slug_bg"
                type="text"
                value={formData.article_slug}
                onChange={(e) => setFormData({ ...formData, article_slug: e.target.value })}
                disabled={isLoading}
                placeholder="auto-generated from headline if empty"
              />
            </div>

            <div className="form-group">
              <label htmlFor="article_category_bg">Category</label>
              <select
                id="article_category_bg"
                value={formData.article_category}
                onChange={(e) => setFormData({ ...formData, article_category: e.target.value })}
                disabled={isLoading}
              >
                {ARTICLE_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="article_is_primary_bg">
                <input
                  id="article_is_primary_bg"
                  type="checkbox"
                  checked={formData.article_is_primary}
                  onChange={(e) => setFormData({ ...formData, article_is_primary: e.target.checked })}
                  disabled={isLoading}
                />{' '}
                Primary article (default for /blog redirect)
              </label>
            </div>
            {(product as { article?: { published_at?: string; updated_at?: string } }).article?.published_at && (
              <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 1rem 0.5rem' }}>
                First published:{' '}
                {new Date(
                  (product as { article?: { published_at?: string } }).article!.published_at!
                ).toLocaleString()}
              </p>
            )}
            {(product as { article?: { updated_at?: string } }).article?.updated_at && (
              <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 1rem 1rem' }}>
                Last updated:{' '}
                {new Date(
                  (product as { article?: { updated_at?: string } }).article!.updated_at!
                ).toLocaleString()}
              </p>
            )}

            <div className="form-group">
              <label htmlFor="article_headline_bg">Headline (H1)</label>
              <input
                id="article_headline_bg"
                type="text"
                value={formData.article_headline}
                onChange={(e) => setFormData({ ...formData, article_headline: e.target.value })}
                disabled={isLoading}
                maxLength={255}
                placeholder="e.g. Galaxy A42 5G in Kenya: who should buy it?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="article_seo_title_bg">
                SEO title (page title)
                <span
                  className="char-count"
                  style={{
                    float: 'right',
                    fontWeight: 'normal',
                    color: formData.article_seo_title.length > 60 ? '#dc3545' : '#666',
                  }}
                >
                  {formData.article_seo_title.length}/60
                </span>
              </label>
              <input
                id="article_seo_title_bg"
                type="text"
                maxLength={60}
                value={formData.article_seo_title}
                onChange={(e) => setFormData({ ...formData, article_seo_title: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="article_seo_description_bg">
                Meta description
                <span
                  className="char-count"
                  style={{
                    float: 'right',
                    fontWeight: 'normal',
                    color: formData.article_seo_description.length > 160 ? '#dc3545' : '#666',
                  }}
                >
                  {formData.article_seo_description.length}/160
                </span>
              </label>
              <textarea
                id="article_seo_description_bg"
                maxLength={160}
                rows={3}
                value={formData.article_seo_description}
                onChange={(e) => setFormData({ ...formData, article_seo_description: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="article_body_bg">Body</label>
              <RichTextEditor
                value={formData.article_body}
                onChange={(html) => setFormData({ ...formData, article_body: html })}
                placeholder="Start writing your buying guide…"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.article_is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, article_is_published: e.target.checked }))
                  }
                  disabled={isLoading}
                />
                <span>Published on storefront</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Saving…' : 'Save buying guide'}
              </button>
            </div>
          </form>
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
                <label htmlFor="default_selling_price">Default selling price (KES)</label>
                <input
                  id="default_selling_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.default_selling_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_selling_price: e.target.value,
                    })
                  }
                  placeholder="e.g., 45000"
                  disabled={isLoading}
                />
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Shown on the storefront when no listable units have a price; used as unit selling price if omitted when creating a unit.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="storage_gb">Storage (GB)</label>
                  <input
                    id="storage_gb"
                    type="number"
                    min="0"
                    value={formData.storage_gb ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storage_gb: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 256"
                    disabled={isLoading}
                  />
                  <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    Storage capacity (e.g., 128, 256, 512). Use ProductVariants for multiple options.
                  </small>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="ram_gb">RAM (GB)</label>
                  <input
                    id="ram_gb"
                    type="number"
                    min="0"
                    value={formData.ram_gb ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ram_gb: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 8"
                    disabled={isLoading}
                  />
                  <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    RAM amount (e.g., 8, 12, 16). Use ProductVariants for multiple options.
                  </small>
                </div>
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

          {/* Product Variants: Inventory Managers and Superusers only */}
          {(isInventoryManager || isSuperuser) && (
            product?.id ? (
              <ProductVariantEditor productId={product.id} />
            ) : (
              <div className="form-group" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Product Variants</h4>
                  <button
                    type="button"
                    className="btn-small btn-info"
                    onClick={() => setPendingVariants(prev => [...prev, { storage_gb: null, ram_gb: null, default_selling_price: '', default_cost_of_unit: '', is_active: true }])}
                  >
                    + Add Variant
                  </button>
                </div>
                {pendingVariants.length === 0 && (
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    No variants yet. Add storage/RAM/price combinations for this product.
                  </p>
                )}
                {pendingVariants.map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.75rem', marginBottom: '0.5rem', background: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <div style={{ flex: '0 0 90px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Storage (GB)</label>
                      <input type="number" min="0" value={v.storage_gb ?? ''} onChange={(e) => setPendingVariants(prev => { const n = [...prev]; n[idx] = { ...n[idx], storage_gb: e.target.value ? parseInt(e.target.value) : null }; return n; })} placeholder="e.g. 256" style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ flex: '0 0 80px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>RAM (GB)</label>
                      <input type="number" min="0" value={v.ram_gb ?? ''} onChange={(e) => setPendingVariants(prev => { const n = [...prev]; n[idx] = { ...n[idx], ram_gb: e.target.value ? parseInt(e.target.value) : null }; return n; })} placeholder="e.g. 8" style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ flex: '1', minWidth: '100px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Selling Price (KES)</label>
                      <input type="number" min="0" value={v.default_selling_price} onChange={(e) => setPendingVariants(prev => { const n = [...prev]; n[idx] = { ...n[idx], default_selling_price: e.target.value }; return n; })} placeholder="e.g. 142000" style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ flex: '1', minWidth: '100px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>Cost per Unit (KES)</label>
                      <input type="number" min="0" value={v.default_cost_of_unit} onChange={(e) => setPendingVariants(prev => { const n = [...prev]; n[idx] = { ...n[idx], default_cost_of_unit: e.target.value }; return n; })} placeholder="e.g. 120000" style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ flex: '0 0 auto', alignSelf: 'flex-end' }}>
                      <button type="button" className="btn-small btn-danger" onClick={() => setPendingVariants(prev => prev.filter((_, i) => i !== idx))} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Product Images: Inventory Managers and Content Creators (and Superusers) can upload */}
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
                    disabled={isUploadingImages}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#667eea', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isUploadingImages ? 'Uploading...' : 'Upload Images'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImages([]);
                      previewImages.forEach(url => URL.revokeObjectURL(url));
                      setPreviewImages([]);
                    }}
                    disabled={isUploadingImages}
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
                ? 'Select one or more images, then click Upload Images. The first image is set as primary when the product has no images yet.' 
                : 'Select one or more images. They will be attached when you create the product. The first image will be set as primary.'}
            </small>
          </div>

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
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                });
              }}
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
              YouTube watch, Shorts, youtu.be, or Vimeo links play in the storefront. For the homepage
              product-video carousel, also add the <strong>Video</strong> tag to this product.
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

          {(isContentCreator || isInventoryManager || isSuperuser) && product && (
            <>
              <div className="form-section-divider" id="buying-guide">
                <h3>Buying guide</h3>
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                When published, this guide is shown at{' '}
                <code>/products/{(product as { slug?: string }).slug || '…'}/blog</code> on the storefront.
              </p>
              {(product as any).article?.published_at && (
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  First published: {new Date((product as any).article.published_at).toLocaleString()}
                </p>
              )}
              {(product as any).article?.updated_at && (
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Last updated: {new Date((product as any).article.updated_at).toLocaleString()}
                </p>
              )}

              <div className="form-group">
                <label htmlFor="article_headline">Article headline (H1)</label>
                <input
                  id="article_headline"
                  type="text"
                  value={formData.article_headline}
                  onChange={(e) => setFormData({ ...formData, article_headline: e.target.value })}
                  disabled={isLoading}
                  maxLength={255}
                  placeholder="e.g. Galaxy A42 5G in Kenya: who should buy it?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="article_seo_title">
                  Article SEO title
                  <span className="char-count" style={{ float: 'right', fontWeight: 'normal', color: formData.article_seo_title.length > 60 ? '#dc3545' : '#666' }}>
                    {formData.article_seo_title.length}/60
                  </span>
                </label>
                <input
                  id="article_seo_title"
                  type="text"
                  maxLength={60}
                  value={formData.article_seo_title}
                  onChange={(e) => setFormData({ ...formData, article_seo_title: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="article_seo_description">
                  Article meta description
                  <span className="char-count" style={{ float: 'right', fontWeight: 'normal', color: formData.article_seo_description.length > 160 ? '#dc3545' : '#666' }}>
                    {formData.article_seo_description.length}/160
                  </span>
                </label>
                <textarea
                  id="article_seo_description"
                  maxLength={160}
                  rows={3}
                  value={formData.article_seo_description}
                  onChange={(e) => setFormData({ ...formData, article_seo_description: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="article_body">Article body</label>
                <RichTextEditor
                  value={formData.article_body}
                  onChange={(html) => setFormData({ ...formData, article_body: html })}
                  placeholder="Start writing your buying guide…"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.article_is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, article_is_published: e.target.checked }))}
                    disabled={isLoading}
                  />
                  <span>Publish buying guide on storefront</span>
                </label>
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

