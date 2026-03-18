import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UnitsService,
  UnitImagesService,
  ColorsService,
  SourcesService,
  InventoryUnitRW,
  InventoryUnitRequest,
  Color,
  ProductTemplate,
  ConditionEnum,
  SourceEnum,
  AccessoriesLinkService,
  ProductAccessory,
} from '../api/index';
import { useDebounce } from '../hooks/useDebounce';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used via useProductsList() result
import { useProductsList } from '../hooks/useProductsList';

interface UnitFormProps {
  unit: InventoryUnitRW | null;
  onClose: () => void;
  onSuccess: () => void;
  defaultProductId?: number;
}

export const UnitForm: React.FC<UnitFormProps> = ({
  unit,
  onClose,
  onSuccess,
  defaultProductId,
}) => {
  // Form data type that includes write fields (_id) for form state
  type UnitFormData = Partial<InventoryUnitRequest> & {
    product_template_id?: number;
    product_color_id?: number;
    acquisition_source_details_id?: number;
    condition?: ConditionEnum;
    source?: SourceEnum;
    available_online?: boolean;
  };
  
  const [formData, setFormData] = useState<UnitFormData>({
    product_template_id: defaultProductId || (unit?.product_template as number | undefined) || undefined,
    selling_price: undefined,
    cost_of_unit: undefined,
    condition: undefined,
    source: undefined,
    available_online: true,
    grade: undefined,
    date_sourced: undefined,
    quantity: 1,
    serial_number: '',
    imei: '',
    storage_gb: undefined,
    ram_gb: undefined,
    battery_mah: undefined,
    is_sim_enabled: false,
    processor_details: '',
    product_color_id: undefined,
    acquisition_source_details_id: undefined,
  });

  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [showColorForm, setShowColorForm] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex_code: '#000000' });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentProducts, setRecentProducts] = useState<ProductTemplate[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [compatibleProductIds, setCompatibleProductIds] = useState<number[]>([]);

  // Accessory-only: multi-row variants (color, compatible devices, qty, images per row)
  type AccessoryVariantRow = {
    id: string;
    unitId?: number;
    colorId?: number;
    quantity: number;
    compatibleProductIds: number[];
    imageFiles: File[];
    previewUrls: string[];
    existingImages?: Array<{ id: number; url: string; isPrimary?: boolean }>;
  };
  const [variantRows, setVariantRows] = useState<AccessoryVariantRow[]>([]);
  const [isSubmittingVariants, setIsSubmittingVariants] = useState(false);
  const [showVariantColorForm, setShowVariantColorForm] = useState(false);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [activeDeviceSearchRowId, setActiveDeviceSearchRowId] = useState<string | null>(null);
  const [deviceSearchHighlightedIndex, setDeviceSearchHighlightedIndex] = useState(-1);
  const deviceSearchInputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);
  const debouncedDeviceSearch = useDebounce(deviceSearchTerm, 300);

  const { data: productsData } = useProductsList(
    debouncedProductSearch.trim() || undefined
  );
  const { data: deviceSearchProductsData } = useProductsList(
    debouncedDeviceSearch.trim() || undefined
  );

  // Enhanced filter with fuzzy matching and scoring
  const filteredProducts = useMemo(() => {
    if (!productsData?.results) return [];
    
    // Use current search term (not debounced) for immediate UI feedback
    const searchTerm = productSearchTerm.trim();
    
    if (!searchTerm) {
      // When no search, show recent products first, then top 50 products
      const recentIds = new Set(recentProducts.map(p => p.id));
      const otherProducts = productsData.results
        .filter(p => !recentIds.has(p.id))
        .slice(0, 50);
      return [...recentProducts, ...otherProducts];
    }
    
    const searchLower = searchTerm.toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
    
    return productsData.results
      .map((product: ProductTemplate) => {
      const name = (product.product_name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const model = (product.model_series || '').toLowerCase();
        const type = (product.product_type_display || '').toLowerCase();
        
        // Calculate match score
        let score = 0;
        searchTerms.forEach(term => {
          if (name.includes(term)) score += 10;
          if (name.startsWith(term)) score += 5; // Bonus for prefix match
          if (brand.includes(term)) score += 8;
          if (model.includes(term)) score += 8;
          if (type.includes(term)) score += 3;
        });
        
        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 20) // Limit results
      .map(item => item.product);
  }, [productsData, productSearchTerm, recentProducts]);

  // Update display text when product is selected and add to recent
  useEffect(() => {
    if (formData.product_template_id && productsData?.results) {
      const selected = productsData.results.find(
        (p: ProductTemplate) => p.id === formData.product_template_id
      );
      if (selected) {
        const display = `${selected.product_name}${selected.brand ? ` - ${selected.brand}` : ''}${selected.model_series ? ` (${selected.model_series})` : ''}`;
        setSelectedProductDisplay(display);
        
        // Add to recent products (max 5)
        setRecentProducts(prev => {
          const filtered = prev.filter(p => p.id !== selected.id);
          return [selected, ...filtered].slice(0, 5);
        });
      } else {
        setSelectedProductDisplay('');
      }
    } else {
      setSelectedProductDisplay('');
    }
  }, [formData.product_template_id, productsData]);

  // Load recent products from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent-products');
      if (stored && productsData?.results) {
        const recentIds = JSON.parse(stored) as number[];
        const results = productsData.results; // Store in const for type narrowing
        const recent = recentIds
          .map(id => results.find(p => p.id === id))
          .filter((p): p is ProductTemplate => p !== undefined);
        if (recent.length > 0) {
          setRecentProducts(recent);
        }
      }
    } catch (e) {
      console.error('Failed to load recent products:', e);
    }
  }, [productsData]);

  // Save recent products to localStorage
  useEffect(() => {
    if (recentProducts.length > 0) {
      try {
        const ids = recentProducts.map(p => p.id).filter((id): id is number => id !== undefined);
        localStorage.setItem('recent-products', JSON.stringify(ids));
      } catch (e) {
        console.error('Failed to save recent products:', e);
      }
    }
  }, [recentProducts]);

  // Fetch colors for dropdown
  const { data: colorsData } = useQuery({
    queryKey: ['colors-all'],
    queryFn: () => ColorsService.colorsList(1),
  });

  // Mutation to create a new color
  const createColorMutation = useMutation({
    mutationFn: (colorData: Color) => ColorsService.colorsCreate(colorData),
    onSuccess: (response: any) => {
      // Invalidate and refetch colors list
      queryClient.invalidateQueries({ queryKey: ['colors-all'] });
      
      // Select the newly created color
      const newColorId = response.id;
      if (newColorId) {
        setFormData(prev => ({
          ...prev,
          product_color_id: newColorId,
        }));
      }
      
      // Reset form and close (both main and variant color forms)
      setNewColor({ name: '', hex_code: '#000000' });
      setShowColorForm(false);
      setShowVariantColorForm(false);
    },
    onError: (err: any) => {
      let errorMessage = 'Failed to create color: ';
      if (err.body && typeof err.body === 'object') {
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n' + errorList;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      alert(errorMessage);
      console.error('Create color error:', err);
    },
  });

  // Fetch acquisition sources for dropdown
  const { data: sourcesData } = useQuery({
    queryKey: ['sources-all'],
    queryFn: () => SourcesService.sourcesList(1),
  });

  // Fetch unit details if editing
  const { data: unitDetails } = useQuery({
    queryKey: ['unit-details', unit?.id],
    queryFn: () => {
      if (!unit?.id) throw new Error('No unit ID');
      return UnitsService.unitsRetrieve(unit.id);
    },
    enabled: !!unit?.id,
  });

  // Use unit detail (already fetched for form) for images — avoids loading all unit images in the system
  const existingImages = useMemo(() => {
    const images = unitDetails?.images;
    if (!images || !Array.isArray(images)) return null;
    return { results: images, count: images.length };
  }, [unitDetails?.images]);

  // Populate form when editing (unitDetails loaded)
  useEffect(() => {
    if (!unitDetails) return;
      // Format date_sourced to YYYY-MM-DD if it's a datetime string
      let formattedDateSourced = unitDetails.date_sourced || undefined;
      if (formattedDateSourced && typeof formattedDateSourced === 'string') {
        // If it includes time, extract just the date part
        if (formattedDateSourced.includes('T')) {
          formattedDateSourced = formattedDateSourced.split('T')[0];
        }
      }
      
      setFormData({
        product_template_id: unitDetails.product_template as number | undefined,
        selling_price: unitDetails.selling_price,
        cost_of_unit: unitDetails.cost_of_unit,
        condition: unitDetails.condition || undefined,
        source: unitDetails.source || undefined,
        available_online: (unitDetails as any).available_online !== undefined ? (unitDetails as any).available_online : true,
        grade: unitDetails.grade || undefined,
        date_sourced: formattedDateSourced,
        quantity: unitDetails.quantity || 1,
        serial_number: unitDetails.serial_number || '',
        imei: unitDetails.imei || '',
        storage_gb: unitDetails.storage_gb,
        ram_gb: unitDetails.ram_gb,
        battery_mah: unitDetails.battery_mah,
        is_sim_enabled: unitDetails.is_sim_enabled || false,
        processor_details: unitDetails.processor_details || '',
        product_color_id: unitDetails.product_color ? (typeof unitDetails.product_color === 'number' ? unitDetails.product_color : (unitDetails.product_color as any).id) : undefined,
        acquisition_source_details_id: unitDetails.acquisition_source_details ? (typeof unitDetails.acquisition_source_details === 'number' ? unitDetails.acquisition_source_details : (unitDetails.acquisition_source_details as any).id) : undefined,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitDetails]);

  // Reset form when switching into "create" mode.
  // This must NOT depend on productsData, otherwise typing in the product search will trigger resets.
  useEffect(() => {
    if (unit) return;
    setFormData({
      product_template_id: undefined,
      selling_price: undefined,
      cost_of_unit: undefined,
      condition: undefined,
      source: undefined,
      available_online: true,
      grade: undefined,
      date_sourced: undefined,
      quantity: 1,
      serial_number: '',
      imei: '',
      storage_gb: undefined,
      ram_gb: undefined,
      battery_mah: undefined,
      is_sim_enabled: false,
      processor_details: '',
      product_color_id: undefined,
      acquisition_source_details_id: undefined,
    });
    setSelectedProductType('');
    setProductSearchTerm('');
    setSelectedProductDisplay('');
    setShowProductSuggestions(false);
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    setSelectedImages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

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

  // Update product type when product selection changes
  useEffect(() => {
    if (formData.product_template_id) {
      const product = productsData?.results?.find(
        (p) => p.id === formData.product_template_id
      );
      const newProductType = product?.product_type || '';
      setSelectedProductType(newProductType);
      
      // Auto-set quantity to 1 for non-accessories (unique items)
      if (newProductType && newProductType !== 'AC') {
        setFormData(prev => ({
          ...prev,
          quantity: 1, // Force quantity to 1 for unique items
        }));
      }
    } else {
      setSelectedProductType('');
    }
  }, [formData.product_template_id, productsData]);

  const isAccessoryProduct = selectedProductType === 'AC';

  // Load existing accessory links for this accessory product template (for convenience)
  const { data: accessoryLinks } = useQuery({
    queryKey: ['accessory-links', formData.product_template_id],
    queryFn: () => {
      if (!formData.product_template_id) {
        throw new Error('No accessory product id');
      }
      return AccessoriesLinkService.accessoriesLinkList(formData.product_template_id, undefined, 1, 200);
    },
    enabled: !!formData.product_template_id && isAccessoryProduct,
  });

  useEffect(() => {
    if (accessoryLinks && Array.isArray((accessoryLinks as any).results)) {
      const ids = (accessoryLinks as any).results
        .map((link: ProductAccessory) => link.main_product)
        .filter((id: number | null | undefined): id is number => typeof id === 'number');
      setCompatibleProductIds(ids);
      // When editing, hydrate only the first row from existing links (other rows are separate units)
      setVariantRows(prev => {
        if (prev.length === 0) return prev;
        return prev.map((row, i) => (i === 0 ? { ...row, compatibleProductIds: ids } : row));
      });
    }
  }, [accessoryLinks]);

  // Initialize variant rows: when editing accessory, hydrate ONLY this unit (row 1).
  // Additional rows are for creating new units, not for bulk-editing existing ones.
  useEffect(() => {
    if (!unit?.id || !unitDetails) return;
    const productId =
      typeof unitDetails.product_template === 'number'
        ? unitDetails.product_template
        : (unitDetails.product_template as unknown as { id?: number })?.id;
    const product = productsData?.results?.find(
      (p: ProductTemplate) => p.id === productId
    );
    if (product?.product_type !== 'AC') return;
    const colorId = unitDetails.product_color
      ? (typeof unitDetails.product_color === 'number'
        ? unitDetails.product_color
        : (unitDetails.product_color as unknown as { id?: number })?.id)
      : undefined;

    const existingImages =
      Array.isArray((unitDetails as any).images)
        ? (unitDetails as any).images
            .map((img: any) => {
              const url = img?.image_url || img?.image;
              if (!url || typeof url !== 'string') return null;
              return { id: img.id, url, isPrimary: !!img.is_primary };
            })
            .filter(Boolean)
        : [];

    setVariantRows([
      {
        id: '0',
        unitId: unit.id,
        colorId,
        quantity: unitDetails.quantity ?? 1,
        compatibleProductIds: [], // filled by accessoryLinks effect (row 1)
        imageFiles: [],
        previewUrls: [],
        existingImages,
      },
    ]);
  }, [unit?.id, unitDetails, productsData?.results]);

  // When creating new unit and user selects accessory, ensure at least one variant row
  useEffect(() => {
    if (!unit && isAccessoryProduct && variantRows.length === 0) {
      setVariantRows([
        {
          id: crypto.randomUUID?.() ?? `row-${Date.now()}`,
          colorId: undefined,
          quantity: 1,
          compatibleProductIds: [],
          imageFiles: [],
          previewUrls: [],
        },
      ]);
    }
  }, [unit, isAccessoryProduct, variantRows.length]);

  const createMutation = useMutation({
    mutationFn: (data: InventoryUnitRequest) =>
      UnitsService.unitsCreate(data),
    onSuccess: async (createdUnit) => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      
      // Upload images if any were selected during creation
      if (createdUnit?.id && selectedImages.length > 0) {
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            await UnitImagesService.unitImagesCreate({
              inventory_unit: createdUnit.id,
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
          alert(`Unit created, but some images failed to upload: ${err.message || 'Unknown error'}`);
        }
      }

      // For accessories, optionally create ProductAccessory links for selected compatible products
      try {
        const accessoryProductId = createdUnit?.product_template as number | undefined;
        if (accessoryProductId && selectedProductType === 'AC' && compatibleProductIds.length > 0) {
          for (const mainProductId of compatibleProductIds) {
            try {
              await AccessoriesLinkService.accessoriesLinkCreate({
                main_product: mainProductId,
                accessory: accessoryProductId,
                required_quantity: 1,
              });
            } catch (linkErr: any) {
              // Ignore duplicate link errors; log others for debugging
              // eslint-disable-next-line no-console
              console.warn('Accessory link create error', linkErr);
            }
          }
        }
      } catch (linkOuterErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to create accessory links from unit form', linkOuterErr);
      }
      
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      // Try to extract detailed validation errors from the API response
      let errorMessage = 'Failed to create unit: ';
      
      if (err.body && typeof err.body === 'object') {
        // API returned validation errors as an object
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n' + errorList;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      
      alert(errorMessage);
      console.error('Create unit error:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InventoryUnitRequest) => {
      if (!unit?.id) throw new Error('Unit ID is required');
      return UnitsService.unitsUpdate(unit.id, data);
    },
    onSuccess: async () => {
      // For accessories, optionally create ProductAccessory links for selected compatible products.
      // We only add missing links here; existing ones can still be managed from the dedicated accessories page.
      try {
        const accessoryProductId =
          (formData.product_template_id as number | undefined) ||
          (unit?.product_template as number | undefined);
        if (accessoryProductId && selectedProductType === 'AC' && compatibleProductIds.length > 0) {
          for (const mainProductId of compatibleProductIds) {
            try {
              await AccessoriesLinkService.accessoriesLinkCreate({
                main_product: mainProductId,
                accessory: accessoryProductId,
                required_quantity: 1,
              });
            } catch (linkErr: any) {
              // Ignore duplicate link errors; log others for debugging
              // eslint-disable-next-line no-console
              console.warn('Accessory link create error (update)', linkErr);
            }
          }
        }
      } catch (linkOuterErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to update accessory links from unit form', linkOuterErr);
      }

      onSuccess();
    },
    onError: (err: any) => {
      // Try to extract detailed validation errors from the API response
      let errorMessage = 'Failed to update unit: ';
      
      if (err.body && typeof err.body === 'object') {
        // API returned validation errors as an object
        const errors = err.body;
        const errorList = Object.entries(errors)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${field}: ${msg}`;
          })
          .join('\n');
        errorMessage += '\n' + errorList;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      
      alert(errorMessage);
      console.error('Update unit error:', err);
    },
  });

  // Image upload mutation for units
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!unit?.id) throw new Error('Unit ID required');
      return UnitImagesService.unitImagesCreate({
        inventory_unit: unit.id,
        image: file,
        is_primary: (existingImages?.results?.length || 0) === 0, // First image is primary
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-details', unit?.id] });
      setSelectedImages([]);
    },
    onError: (err: any) => {
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
    },
  });

  // Set primary image mutation
  const setPrimaryImageMutation = useMutation({
    mutationFn: async ({ imageId, isPrimary }: { imageId: number; isPrimary: boolean }) => {
      return UnitImagesService.unitImagesPartialUpdate(imageId, {
        is_primary: isPrimary,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-details', unit?.id] });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return UnitImagesService.unitImagesDestroy(imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-details', unit?.id] });
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

  // Device products (PH, LT, TB) for accessory compatible-devices
  const deviceProducts = useMemo(
    () =>
      productsData?.results?.filter(
        (p: ProductTemplate) =>
          p.product_type === 'PH' || p.product_type === 'LT' || p.product_type === 'TB'
      ) ?? [],
    [productsData?.results]
  );

  // Device search results (type-ahead): PH, LT, TB only, limit 15
  const filteredDeviceProducts = useMemo(() => {
    const list = deviceSearchProductsData?.results?.filter(
      (p: ProductTemplate) =>
        p.product_type === 'PH' || p.product_type === 'LT' || p.product_type === 'TB'
    ) ?? [];
    return list.slice(0, 15);
  }, [deviceSearchProductsData?.results]);

  // Map product id -> product for chip labels (from both main list and device search)
  const productMapById = useMemo(() => {
    const m = new Map<number, ProductTemplate>();
    productsData?.results?.forEach((p: ProductTemplate) => {
      if (p.id != null) m.set(p.id, p);
    });
    deviceSearchProductsData?.results?.forEach((p: ProductTemplate) => {
      if (p.id != null) m.set(p.id, p);
    });
    return m;
  }, [productsData?.results, deviceSearchProductsData?.results]);

  const addVariantRow = () => {
    setVariantRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? `row-${Date.now()}-${prev.length}`,
        colorId: undefined,
        quantity: 1,
        compatibleProductIds: [],
        imageFiles: [],
        previewUrls: [],
      },
    ]);
  };

  const updateVariantRow = (rowId: string, patch: Partial<AccessoryVariantRow>) => {
    setVariantRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, ...patch } : row))
    );
  };

  const removeVariantRow = (rowId: string) => {
    setVariantRows(prev => {
      const next = prev.filter(row => row.id !== rowId);
      next.forEach((row, i) => {
        if (row.previewUrls.length) {
          row.previewUrls.forEach(url => URL.revokeObjectURL(url));
        }
      });
      return next;
    });
  };

  const handleVariantImageSelect = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setVariantRows(prev =>
      prev.map(row =>
        row.id === rowId
          ? {
              ...row,
              imageFiles: [...row.imageFiles, ...files],
              previewUrls: [...row.previewUrls, ...newPreviews],
            }
          : row
      )
    );
    e.target.value = '';
  };

  const handleVariantRemoveImage = (rowId: string, index: number) => {
    setVariantRows(prev =>
      prev.map(row => {
        if (row.id !== rowId) return row;
        URL.revokeObjectURL(row.previewUrls[index]);
        return {
          ...row,
          imageFiles: row.imageFiles.filter((_, i) => i !== index),
          previewUrls: row.previewUrls.filter((_, i) => i !== index),
        };
      })
    );
  };

  const handleUploadImages = async () => {
    if (!unit?.id) {
      alert('Please save the unit first before uploading images');
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

  const buildBaseUnitPayload = (): InventoryUnitRequest => {
    const dateSourced = formData.date_sourced
      ? (typeof formData.date_sourced === 'string'
          ? formData.date_sourced.split('T')[0]
          : formData.date_sourced)
      : undefined;
    return {
      product_template_id: formData.product_template_id!,
      selling_price: formData.selling_price || '0',
      cost_of_unit: formData.cost_of_unit || '0',
      condition: formData.condition,
      source: formData.source,
      available_online: formData.available_online !== undefined ? formData.available_online : true,
      grade: formData.grade || undefined,
      date_sourced: dateSourced,
      quantity: 1, // overridden per row for accessories
      storage_gb: formData.storage_gb || undefined,
      ram_gb: formData.ram_gb || undefined,
      battery_mah: formData.battery_mah || undefined,
      is_sim_enabled: formData.is_sim_enabled || false,
      processor_details: formData.processor_details || undefined,
      product_color_id: undefined, // overridden per row for accessories
      acquisition_source_details_id: formData.acquisition_source_details_id || undefined,
      serial_number: formData.serial_number || undefined,
      imei: formData.imei || undefined,
    };
  };

  const runAccessoryVariantsSubmit = async () => {
    const productTemplateId = formData.product_template_id;
    if (!productTemplateId) {
      alert('Please select a product template.');
      return;
    }
    setIsSubmittingVariants(true);
    const basePayload = buildBaseUnitPayload();

    try {
      if (unit?.id) {
        const row0 = variantRows[0];
        await UnitsService.unitsUpdate(unit.id, {
          ...basePayload,
          product_color_id: row0?.colorId || undefined,
          quantity: Math.max(1, row0?.quantity ?? 1),
        });
        for (let i = 0; i < (row0?.imageFiles?.length ?? 0); i++) {
          await UnitImagesService.unitImagesCreate({
            inventory_unit: unit.id,
            image: row0.imageFiles[i],
            is_primary: i === 0,
          });
        }
        for (const mainId of (row0?.compatibleProductIds ?? [])) {
          try {
            await AccessoriesLinkService.accessoriesLinkCreate({
              main_product: mainId,
              accessory: productTemplateId,
              required_quantity: 1,
            });
          } catch {
            // ignore duplicate
          }
        }

        for (let i = 1; i < variantRows.length; i++) {
          const row = variantRows[i];
          const created = await UnitsService.unitsCreate({
            ...basePayload,
            product_template_id: productTemplateId,
            product_color_id: row.colorId || undefined,
            quantity: Math.max(1, row.quantity),
          });
          if (created?.id) {
            for (let j = 0; j < row.imageFiles.length; j++) {
              await UnitImagesService.unitImagesCreate({
                inventory_unit: created.id,
                image: row.imageFiles[j],
                is_primary: j === 0,
              });
            }
            for (const mainId of row.compatibleProductIds) {
              try {
                await AccessoriesLinkService.accessoriesLinkCreate({
                  main_product: mainId,
                  accessory: productTemplateId,
                  required_quantity: 1,
                });
              } catch {
                // ignore duplicate
              }
            }
          }
        }
      } else {
        for (let rowIndex = 0; rowIndex < variantRows.length; rowIndex++) {
          const row = variantRows[rowIndex];
          const created = await UnitsService.unitsCreate({
            ...basePayload,
            product_template_id: productTemplateId,
            product_color_id: row.colorId || undefined,
            quantity: Math.max(1, row.quantity),
          });
          if (created?.id) {
            for (let j = 0; j < row.imageFiles.length; j++) {
              await UnitImagesService.unitImagesCreate({
                inventory_unit: created.id,
                image: row.imageFiles[j],
                is_primary: j === 0,
              });
            }
            for (const mainId of row.compatibleProductIds) {
              try {
                await AccessoriesLinkService.accessoriesLinkCreate({
                  main_product: mainId,
                  accessory: productTemplateId,
                  required_quantity: 1,
                });
              } catch {
                // ignore duplicate
              }
            }
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['accessory-links'] });
      queryClient.invalidateQueries({ queryKey: ['product-accessories'] });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Accessory variants submit error', err);
      alert(err?.body?.detail || err?.message || 'Failed to save accessory variants.');
    } finally {
      setIsSubmittingVariants(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentIsAccessory = selectedProductType === 'AC';
    if (currentIsAccessory && variantRows.length > 0) {
      runAccessoryVariantsSubmit();
      return;
    }

    const submitData: any = {
      ...buildBaseUnitPayload(),
      quantity: currentIsAccessory ? (accessoryHasSerial ? 1 : (formData.quantity || 1)) : 1,
      product_color_id: formData.product_color_id || undefined,
    };

    if (unit?.id) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    isSubmittingVariants;
  const isPhoneOrTablet = selectedProductType === 'PH' || selectedProductType === 'TB';
  const isAccessory = selectedProductType === 'AC';
  const accessoryHasSerial = isAccessory && !!formData.serial_number?.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large unit-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{unit ? 'Edit Unit' : 'Create Unit'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          <div className="form-subsection">
            <h3>Product Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product_template_id">
                  Product Template <span className="required">*</span>
                </label>
                <div style={{ position: 'relative', overflow: 'visible' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    {/* Search Icon */}
                    <span style={{
                      position: 'absolute',
                      left: '0.75rem',
                      color: '#6c757d',
                      pointerEvents: 'none',
                      zIndex: 1,
                      fontSize: '1rem',
                    }}>
                      🔍
                    </span>
                    
                  <input
                      ref={searchInputRef}
                    id="product_template_id_search"
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProductSearchTerm(value);
                      setShowProductSuggestions(true);
                        setHighlightedIndex(-1);
                      
                      // Clear selection if user starts typing a new search
                      if (formData.product_template_id) {
                        setFormData(prev => ({ ...prev, product_template_id: undefined }));
                          setSelectedProductDisplay('');
                      }
                    }}
                    onFocus={() => setShowProductSuggestions(true)}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowProductSuggestions(false), 200);
                    }}
                      onKeyDown={(e) => {
                        // Calculate total items (recent + filtered)
                        const searchTerm = productSearchTerm.trim();
                        const totalItems = !searchTerm && recentProducts.length > 0
                          ? recentProducts.length + filteredProducts.filter(p => {
                              const recentIds = new Set(recentProducts.map(rp => rp.id));
                              return !recentIds.has(p.id);
                            }).length
                          : filteredProducts.length;
                        
                        if (!showProductSuggestions || totalItems === 0) {
                          if (e.key === 'Enter' && formData.product_template_id) {
                            e.preventDefault();
                            return;
                          }
                          return;
                        }
                        
                        switch (e.key) {
                          case 'ArrowDown':
                            e.preventDefault();
                            setHighlightedIndex(prev => 
                              prev < totalItems - 1 ? prev + 1 : prev
                            );
                            break;
                          case 'ArrowUp':
                            e.preventDefault();
                            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                            break;
                          case 'Enter':
                            e.preventDefault();
                            if (highlightedIndex >= 0) {
                              let product: ProductTemplate | undefined;
                              
                              // Get product based on highlighted index
                              const searchTerm = productSearchTerm.trim();
                              if (!searchTerm && recentProducts.length > 0) {
                                // Check if index is in recent products
                                if (highlightedIndex < recentProducts.length) {
                                  product = recentProducts[highlightedIndex];
                                } else {
                                  // Index is in filtered products (excluding recent)
                                  const filtered = filteredProducts.filter(p => {
                                    const recentIds = new Set(recentProducts.map(rp => rp.id));
                                    return !recentIds.has(p.id);
                                  });
                                  product = filtered[highlightedIndex - recentProducts.length];
                                }
                              } else {
                                product = filteredProducts[highlightedIndex];
                              }
                              
                              if (product) {
                                const displayText = `${product.product_name}${product.brand ? ` - ${product.brand}` : ''}${product.model_series ? ` (${product.model_series})` : ''}`;
                                const productId = product.id; // Store in const for type narrowing
                                setFormData(prev => ({
                                  ...prev,
                                  product_template_id: productId,
                                }));
                                setProductSearchTerm('');
                                setSelectedProductDisplay(displayText);
                                setShowProductSuggestions(false);
                                setHighlightedIndex(-1);
                              }
                            }
                            break;
                          case 'Escape':
                            setShowProductSuggestions(false);
                            setHighlightedIndex(-1);
                            break;
                        }
                    }}
                    placeholder="Type to search products (name, brand, model)..."
                    required
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem', // Add left padding for icon
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '1rem',
                    }}
                    autoComplete="off"
                  />
                    
                    {/* Clear Button */}
                    {(productSearchTerm || selectedProductDisplay) && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductSearchTerm('');
                          setSelectedProductDisplay('');
                          setFormData(prev => ({ ...prev, product_template_id: undefined }));
                          setShowProductSuggestions(false);
                          setHighlightedIndex(-1);
                          searchInputRef.current?.focus();
                        }}
                        style={{
                          position: 'absolute',
                          right: '0.5rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          color: '#6c757d',
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 1,
                        }}
                        title="Clear selection"
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {showProductSuggestions && filteredProducts.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '300px',
                        width: 'max-content',
                        maxWidth: '600px',
                        zIndex: 9999,
                        backgroundColor: 'white',
                        border: '2px solid #667eea',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        marginTop: '2px',
                      }}
                    >
                      {/* Recent Products Section */}
                      {!productSearchTerm.trim() && recentProducts.length > 0 && (
                        <>
                          <div style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#f8f9fa', 
                            borderBottom: '1px solid #dee2e6',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#6c757d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>
                            Recent Selections
                          </div>
                          {recentProducts.map((product: ProductTemplate, index) => {
                        const displayText = `${product.product_name}${product.brand ? ` - ${product.brand}` : ''}${product.model_series ? ` (${product.model_series})` : ''}`;
                        const isSelected = formData.product_template_id === product.id;
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
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                product_template_id: product.id,
                              }));
                              setProductSearchTerm('');
                              setSelectedProductDisplay(displayText);
                              setShowProductSuggestions(false);
                                  setHighlightedIndex(-1);
                            }}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            style={{
                                  padding: '0.875rem 1rem',
                              cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0',
                                  backgroundColor: isSelected || isHighlighted ? '#e7f3ff' : 'white',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                      fontWeight: 600, 
                                      color: '#212529',
                                      fontSize: '0.95rem',
                                      marginBottom: '0.25rem',
                                      whiteSpace: 'nowrap',
                                    }}>
                                      {product.product_name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {product.brand && (
                                        <span style={{ 
                                          backgroundColor: '#f0f0f0',
                                          padding: '0.125rem 0.5rem',
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                        }}>
                                          {product.brand}
                                        </span>
                                      )}
                                      {product.model_series && (
                                        <span style={{ 
                                          backgroundColor: '#f0f0f0',
                                          padding: '0.125rem 0.5rem',
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                        }}>
                                          {product.model_series}
                                        </span>
                                      )}
                                      {product.product_type_display && (
                                        <span style={{ 
                                          backgroundColor: typeColors[product.product_type_display] || '#6c757d',
                                          color: 'white',
                                          padding: '0.125rem 0.5rem',
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                        }}>
                                          {product.product_type_display}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <span style={{ color: '#28a745', fontSize: '1.2rem', marginLeft: '0.5rem' }}>
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {filteredProducts.length > recentProducts.length && (
                            <div style={{ 
                              padding: '0.5rem 1rem', 
                              backgroundColor: '#f8f9fa', 
                              borderTop: '1px solid #dee2e6',
                              borderBottom: '1px solid #dee2e6',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#6c757d',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              All Products
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Search Results Header */}
                      {productSearchTerm.trim() && (
                        <div style={{ 
                          padding: '0.5rem 1rem', 
                          backgroundColor: '#f8f9fa', 
                          borderBottom: '1px solid #dee2e6',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#6c757d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Search Results
                        </div>
                      )}
                      
                      {/* Search Results - Filter out recent products when showing them separately */}
                      {(() => {
                        const searchTerm = productSearchTerm.trim();
                        const productsToShow = !searchTerm && recentProducts.length > 0
                          ? filteredProducts.filter(product => {
                              const recentIds = new Set(recentProducts.map(p => p.id));
                              return !recentIds.has(product.id);
                            })
                          : filteredProducts;
                        
                        return productsToShow.map((product: ProductTemplate, index) => {
                          const displayText = `${product.product_name}${product.brand ? ` - ${product.brand}` : ''}${product.model_series ? ` (${product.model_series})` : ''}`;
                          const isSelected = formData.product_template_id === product.id;
                          const actualIndex = !searchTerm && recentProducts.length > 0 
                            ? recentProducts.length + index 
                            : index;
                          const isHighlighted = highlightedIndex === actualIndex;
                        
                        // Product type badge colors
                        const typeColors: Record<string, string> = {
                          'Phone': '#007bff',
                          'Laptop': '#28a745',
                          'Tablet': '#ffc107',
                          'Accessory': '#6c757d',
                        };
                        
                        return (
                          <div
                            key={product.id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                product_template_id: product.id,
                              }));
                              setProductSearchTerm('');
                              setSelectedProductDisplay(displayText);
                              setShowProductSuggestions(false);
                              setHighlightedIndex(-1);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setHighlightedIndex(actualIndex)}
                            style={{
                              padding: '0.875rem 1rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              backgroundColor: isSelected || isHighlighted ? '#e7f3ff' : 'white',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  fontWeight: 600, 
                                  color: '#212529',
                                  fontSize: '0.95rem',
                                  marginBottom: '0.25rem',
                                  whiteSpace: 'nowrap',
                                }}>
                              {product.product_name}
                            </div>
                                <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  {product.brand && (
                                    <span style={{ 
                                      backgroundColor: '#f0f0f0',
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem',
                                    }}>
                                      {product.brand}
                                    </span>
                                  )}
                                  {product.model_series && (
                                    <span style={{ 
                                      backgroundColor: '#f0f0f0',
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem',
                                    }}>
                                      {product.model_series}
                                    </span>
                                  )}
                              {product.product_type_display && (
                                    <span style={{ 
                                      backgroundColor: typeColors[product.product_type_display] || '#6c757d',
                                      color: 'white',
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}>
                                      {product.product_type_display}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <span style={{ color: '#28a745', fontSize: '1.2rem', marginLeft: '0.5rem' }}>
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })})()}
                      
                      {filteredProducts.length >= 20 && productSearchTerm.trim() && (
                        <div style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          color: '#6c757d',
                          fontSize: '0.875rem',
                          borderTop: '1px solid #f0f0f0',
                          backgroundColor: '#f8f9fa',
                        }}>
                          Showing top 20 results. Refine your search for more.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showProductSuggestions && productSearchTerm.trim() && filteredProducts.length === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '300px',
                        width: 'max-content',
                        maxWidth: '600px',
                        zIndex: 9999,
                        backgroundColor: 'white',
                        border: '2px solid #ced4da',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        marginTop: '2px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                      <div style={{ color: '#495057', fontWeight: 500, marginBottom: '0.25rem' }}>
                        No products found
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                        No products match "{productSearchTerm}". Try different keywords or check spelling.
                      </div>
                    </div>
                  )}
                  
                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    name="product_template_id"
                    value={formData.product_template_id || ''}
                    required
                  />
                </div>
                <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {selectedProductDisplay 
                    ? `Selected: ${selectedProductDisplay}` 
                    : 'Search by product name, brand, or model series. Use arrow keys to navigate, Enter to select, Esc to close.'}
                </small>
              </div>

              {!isAccessory && (
                <div className="form-group">
                  <label htmlFor="product_color_id">Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <select
                      id="product_color_id"
                      value={formData.product_color_id || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        product_color_id: e.target.value ? parseInt(e.target.value) : undefined,
                      })}
                      disabled={isLoading || showColorForm}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select color</option>
                      {colorsData?.results?.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowColorForm(true)}
                      disabled={isLoading || showColorForm}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                      }}
                      title="Add new color"
                    >
                      + Add
                    </button>
                  </div>
                  {showColorForm && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <strong>Add New Color</strong>
                        <button
                          type="button"
                          onClick={() => {
                            setShowColorForm(false);
                            setNewColor({ name: '', hex_code: '#000000' });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            color: '#666',
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <div>
                          <label htmlFor="new_color_name" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                            Color Name <span style={{ color: 'red' }}>*</span>
                          </label>
                          <input
                            id="new_color_name"
                            type="text"
                            value={newColor.name}
                            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                            placeholder="e.g., Black, Silver, Gold"
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                            disabled={createColorMutation.isPending}
                          />
                        </div>
                        <div>
                          <label htmlFor="new_color_hex" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                            Hex Code <span style={{ color: 'red' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              id="new_color_hex"
                              type="color"
                              value={newColor.hex_code}
                              onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value.toUpperCase() })}
                              style={{
                                width: '60px',
                                height: '40px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              disabled={createColorMutation.isPending}
                            />
                            <input
                              type="text"
                              value={newColor.hex_code}
                              onChange={(e) => {
                                const hex = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 7);
                                if (hex.startsWith('#') || hex.length === 0) {
                                  setNewColor({ ...newColor, hex_code: hex.startsWith('#') ? hex : '#' + hex });
                                }
                              }}
                              placeholder="#000000"
                              pattern="^#[0-9A-F]{6}$"
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                              }}
                              disabled={createColorMutation.isPending}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newColor.name.trim() || !newColor.hex_code) {
                                alert('Please fill in both color name and hex code');
                                return;
                              }
                              createColorMutation.mutate({
                                name: newColor.name.trim(),
                                hex_code: newColor.hex_code,
                              });
                            }}
                            disabled={createColorMutation.isPending || !newColor.name.trim() || !newColor.hex_code}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            {createColorMutation.isPending ? 'Creating...' : 'Create Color'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowColorForm(false);
                              setNewColor({ name: '', hex_code: '#000000' });
                            }}
                            disabled={createColorMutation.isPending}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAccessory && variantRows.length > 0 && (
              <div className="form-subsection" style={{ marginTop: '1rem' }}>
                <div className="variant-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Accessory variants</h3>
                  <button
                    type="button"
                    onClick={() => setShowVariantColorForm(true)}
                    disabled={isLoading || showVariantColorForm}
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: '#0d6efd',
                      background: 'transparent',
                      border: '1px solid #0d6efd',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    + Add color
                  </button>
                </div>
                {showVariantColorForm && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--md-surface-container-high)',
                    borderRadius: 8,
                    border: '1px solid var(--md-outline-variant)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '0.9375rem' }}>Add new color</strong>
                      <button
                        type="button"
                        onClick={() => { setShowVariantColorForm(false); setNewColor({ name: '', hex_code: '#000000' }); }}
                        style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6c757d' }}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Color name <span style={{ color: 'var(--md-error)' }}>*</span></label>
                        <input
                          type="text"
                          value={newColor.name}
                          onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Black, Silver"
                          style={{ width: '100%', padding: '0.5rem 0.6rem', border: '1px solid var(--md-outline-variant)', borderRadius: 6, backgroundColor: 'var(--md-surface-container-low)', color: 'var(--md-on-surface)' }}
                          disabled={createColorMutation.isPending}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Hex <span style={{ color: 'var(--md-error)' }}>*</span></label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={newColor.hex_code}
                            onChange={(e) => setNewColor(prev => ({ ...prev, hex_code: e.target.value }))}
                            style={{ width: 44, height: 36, border: '1px solid var(--md-outline-variant)', borderRadius: 6, cursor: 'pointer', backgroundColor: 'var(--md-surface-container-low)' }}
                            disabled={createColorMutation.isPending}
                          />
                          <input
                            type="text"
                            value={newColor.hex_code}
                            onChange={(e) => {
                              const hex = e.target.value.replace(/[^#0-9A-Fa-f]/g, '').slice(0, 7);
                              setNewColor(prev => ({ ...prev, hex_code: hex.startsWith('#') ? hex : '#' + hex }));
                            }}
                            style={{ flex: 1, padding: '0.5rem 0.6rem', border: '1px solid var(--md-outline-variant)', borderRadius: 6, fontFamily: 'monospace', backgroundColor: 'var(--md-surface-container-low)', color: 'var(--md-on-surface)' }}
                            disabled={createColorMutation.isPending}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColor.name.trim() || !newColor.hex_code) { alert('Enter name and hex.'); return; }
                            createColorMutation.mutate({ name: newColor.name.trim(), hex_code: newColor.hex_code });
                          }}
                          disabled={createColorMutation.isPending || !newColor.name.trim() || !newColor.hex_code}
                          style={{ padding: '0.5rem 1rem', background: 'var(--md-primary)', color: 'var(--md-on-primary)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          {createColorMutation.isPending ? 'Adding…' : 'Add color'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowVariantColorForm(false); setNewColor({ name: '', hex_code: '#000000' }); }}
                          disabled={createColorMutation.isPending}
                          style={{ padding: '0.5rem 1rem', background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface)', border: '1px solid var(--md-outline-variant)', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '0.8125rem', color: 'var(--md-on-surface-variant)', marginBottom: '1rem', marginTop: 0 }}>
                  One row per variant (color, compatible devices, quantity). Images are per row.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {variantRows.map((row) => {
                    const deviceSource = deviceSearchTerm.trim() ? filteredDeviceProducts : deviceProducts.slice(0, 15);
                    const deviceOptions = deviceSource.filter(
                      (p: ProductTemplate): p is ProductTemplate & { id: number } =>
                        p.id != null && !row.compatibleProductIds.includes(p.id)
                    );
                    const isActiveDeviceRow = activeDeviceSearchRowId === row.id;
                    return (
                      <div
                        key={row.id}
                        style={{
                          padding: '1rem',
                          borderRadius: 8,
                          border: '1px solid var(--md-outline-variant)',
                          backgroundColor: 'var(--md-surface-container)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px,1fr) minmax(180px,2fr) minmax(90px,110px) minmax(100px,120px) 36px', gap: '1rem', alignItems: 'start' }} className="variant-row-grid">
                          <div className="variant-cell variant-cell-color">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#495057', marginBottom: '0.35rem' }}>Color</label>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'stretch' }}>
                              <select
                                value={row.colorId ?? ''}
                                onChange={(e) => updateVariantRow(row.id, { colorId: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                                disabled={isLoading}
                                style={{
                                  flex: 1,
                                  height: 52,
                                  minHeight: 52,
                                  boxSizing: 'border-box',
                                  WebkitAppearance: 'none',
                                  MozAppearance: 'none',
                                  appearance: 'none',
                                  padding: '0.5rem 0.6rem',
                                  border: '1px solid var(--md-outline-variant)',
                                  borderRadius: 6,
                                  fontSize: '0.875rem',
                                  lineHeight: 1.2,
                                  backgroundColor: 'var(--md-surface-container-low)',
                                  color: 'var(--md-on-surface)',
                                  minWidth: 0,
                                }}
                              >
                                <option value="">Select</option>
                                {colorsData?.results?.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="variant-cell variant-cell-devices" style={{ position: 'relative', minWidth: 0 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#495057', marginBottom: '0.35rem' }}>Compatible devices</label>
                            <div
                              style={{
                                height: 52,
                                minHeight: 52,
                                boxSizing: 'border-box',
                                padding: '0.5rem 0.6rem',
                                border: '1px solid var(--md-outline-variant)',
                                borderRadius: 6,
                                backgroundColor: 'var(--md-surface-container-low)',
                              }}
                            >
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: row.compatibleProductIds.length > 0 ? '0.35rem' : 0 }}>
                                {row.compatibleProductIds.map((pid) => {
                                  const p = productMapById.get(pid);
                                  const label = p ? `${p.product_name}${p.brand ? ` – ${p.brand}` : ''}${p.model_series ? ` (${p.model_series})` : ''}` : `ID ${pid}`;
                                  return (
                                    <span
                                      key={pid}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.2rem 0.5rem',
                                        fontSize: '0.75rem',
                                        background: 'var(--md-primary-container)',
                                        color: 'var(--md-on-primary-container)',
                                        borderRadius: 9999,
                                        border: '1px solid var(--md-primary)',
                                      }}
                                    >
                                      <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateVariantRow(row.id, { compatibleProductIds: row.compatibleProductIds.filter((id) => id !== pid) })}
                                        disabled={isLoading}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', fontSize: '1rem', lineHeight: 1 }}
                                        aria-label="Remove"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                              <input
                                ref={el => { if (isActiveDeviceRow) deviceSearchInputRef.current = el; }}
                                type="text"
                                value={isActiveDeviceRow ? deviceSearchTerm : ''}
                                onChange={(e) => {
                                  setActiveDeviceSearchRowId(row.id);
                                  setDeviceSearchTerm(e.target.value);
                                  setDeviceSearchHighlightedIndex(-1);
                                }}
                                onFocus={() => {
                                  setActiveDeviceSearchRowId(row.id);
                                  setDeviceSearchHighlightedIndex(-1);
                                }}
                                onBlur={() => setTimeout(() => setActiveDeviceSearchRowId(null), 200)}
                                onKeyDown={(e) => {
                                  if (!isActiveDeviceRow || deviceOptions.length === 0) return;
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setDeviceSearchHighlightedIndex(i => (i < deviceOptions.length - 1 ? i + 1 : i));
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setDeviceSearchHighlightedIndex(i => (i > 0 ? i - 1 : -1));
                                  } else if (e.key === 'Enter' && deviceSearchHighlightedIndex >= 0 && deviceOptions[deviceSearchHighlightedIndex]) {
                                    e.preventDefault();
                                    const p = deviceOptions[deviceSearchHighlightedIndex];
                                    if (p.id != null) {
                                      updateVariantRow(row.id, { compatibleProductIds: [...row.compatibleProductIds, p.id] });
                                    }
                                    setDeviceSearchTerm('');
                                    setDeviceSearchHighlightedIndex(-1);
                                    setActiveDeviceSearchRowId(null);
                                  } else if (e.key === 'Escape') {
                                    setActiveDeviceSearchRowId(null);
                                    setDeviceSearchHighlightedIndex(-1);
                                  }
                                }}
                                placeholder="Search devices…"
                                disabled={isLoading}
                                style={{
                                  width: '100%',
                                  border: 'none',
                                  outline: 'none',
                                  fontSize: '0.875rem',
                                  backgroundColor: 'transparent',
                                  color: 'var(--md-on-surface)',
                                  padding: '0.15rem 0',
                                  minWidth: 120,
                                }}
                              />
                            </div>
                            {isActiveDeviceRow && deviceOptions.length > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  top: '100%',
                                  marginTop: 2,
                                  maxHeight: 220,
                                  overflowY: 'auto',
                                  background: 'var(--md-surface-container-high)',
                                  border: '1px solid var(--md-outline-variant)',
                                  borderRadius: 6,
                                  boxShadow: 'var(--shadow-lg)',
                                  zIndex: 1000,
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                {deviceOptions.map((p: ProductTemplate, idx) => (
                                  <div
                                    key={p.id}
                                    onClick={() => {
                                      if (p.id != null) {
                                        updateVariantRow(row.id, { compatibleProductIds: [...row.compatibleProductIds, p.id] });
                                      }
                                      setDeviceSearchTerm('');
                                      setDeviceSearchHighlightedIndex(-1);
                                      setActiveDeviceSearchRowId(null);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      cursor: 'pointer',
                                      fontSize: '0.875rem',
                                      color: 'var(--md-on-surface)',
                                      backgroundColor: deviceSearchHighlightedIndex === idx ? 'var(--md-surface-container)' : 'transparent',
                                    }}
                                  >
                                    {p.product_name}
                                    {p.brand ? ` – ${p.brand}` : ''}
                                    {p.model_series ? ` (${p.model_series})` : ''}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="variant-cell variant-cell-qty">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#495057', marginBottom: '0.35rem' }}>Qty</label>
                            <input
                              type="number"
                              min={1}
                              value={row.quantity}
                              onChange={(e) => updateVariantRow(row.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                              disabled={isLoading}
                              style={{
                                width: '100%',
                                height: 52,
                                minHeight: 52,
                                boxSizing: 'border-box',
                                padding: '0.5rem 0.6rem',
                                minWidth: 90,
                                border: '1px solid var(--md-outline-variant)',
                                borderRadius: 6,
                                fontSize: '0.875rem',
                                lineHeight: 1.2,
                                backgroundColor: 'var(--md-surface-container-low)',
                                color: 'var(--md-on-surface)',
                              }}
                            />
                          </div>
                          <div className="variant-cell variant-cell-images">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#495057', marginBottom: '0.35rem' }}>Images</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                              {(row.existingImages ?? []).map((img) => (
                                <div key={img.id} style={{ position: 'relative' }}>
                                  <img src={img.url} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--md-outline-variant)' }} />
                                  {img.isPrimary && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: 2,
                                      right: 2,
                                      padding: '1px 4px',
                                      borderRadius: 4,
                                      fontSize: 10,
                                      background: 'var(--md-primary)',
                                      color: 'var(--md-on-primary)',
                                      lineHeight: 1.2,
                                    }}>
                                      Primary
                                    </div>
                                  )}
                                </div>
                              ))}
                              {row.previewUrls.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                  <img src={url} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid #dee2e6' }} />
                                  <button
                                    type="button"
                                    onClick={() => handleVariantRemoveImage(row.id, idx)}
                                    style={{
                                      position: 'absolute',
                                      top: -6,
                                      right: -6,
                                      width: 20,
                                      height: 20,
                                      borderRadius: '50%',
                                      border: 'none',
                                      background: '#dc3545',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      fontSize: 12,
                                      lineHeight: 1,
                                    }}
                                    aria-label="Remove image"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <label style={{ cursor: 'pointer', margin: 0 }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleVariantImageSelect(row.id, e)}
                                  disabled={isLoading}
                                  style={{ display: 'none' }}
                                />
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 80,
                                  height: 52,
                                  border: '1px solid var(--md-outline-variant)',
                                  borderRadius: 6,
                                  fontSize: '1.25rem',
                                  color: 'var(--md-on-surface-variant)',
                                  background: 'var(--md-surface-container-low)',
                                }}>
                                  +
                                </span>
                              </label>
                            </div>
                          </div>
                          <div className="variant-cell variant-cell-remove" style={{ paddingTop: '1.5rem' }}>
                            {variantRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariantRow(row.id)}
                                disabled={isLoading}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc3545',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  fontSize: '1.1rem',
                                }}
                                title="Remove row"
                                aria-label="Remove variant"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={addVariantRow}
                  disabled={isLoading}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--md-on-surface)',
                    background: 'var(--md-surface-container-low)',
                    border: '1px solid var(--md-outline-variant)',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  + Add another variant
                </button>
              </div>
            )}
          </div>

          <div className="form-subsection">
            <h3>Unit Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serial_number">Serial Number</label>
                <input
                  id="serial_number"
                  type="text"
                  value={formData.serial_number || ''}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  disabled={isLoading}
                />
                {isAccessory && (
                  <small className="form-help">
                    Optional for accessories. If provided, quantity is fixed to 1.
                  </small>
                )}
              </div>

              {isPhoneOrTablet && (
                <div className="form-group">
                  <label htmlFor="imei">
                    IMEI <span className="required">*</span>
                  </label>
                  <input
                    id="imei"
                    type="text"
                    value={formData.imei || ''}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                    required={isPhoneOrTablet}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  value={formData.condition || ''}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as ConditionEnum | undefined })}
                  disabled={isLoading}
                >
                  <option value="">Select condition</option>
                  <option value="N">New (N)</option>
                  <option value="R">Refurbished (R)</option>
                  <option value="P">Pre-owned (P)</option>
                  <option value="D">Defective (D)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade</label>
                <select
                  id="grade"
                  value={formData.grade ? String(formData.grade) : ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value || undefined })}
                  disabled={isLoading}
                >
                  <option value="">Select grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="available_online">
                  <input
                    id="available_online"
                    type="checkbox"
                    checked={formData.available_online !== undefined ? formData.available_online : true}
                    onChange={(e) => setFormData({
                      ...formData,
                      available_online: e.target.checked,
                    })}
                    disabled={isLoading}
                  />
                  {' '}Available Online
                </label>
                <small className="form-help">
                  Check this box to make the unit visible on the frontend. Only units with status "Available" and this box checked will be visible.
                </small>
              </div>
            </div>
          </div>

          <div className="form-subsection">
            <h3>Specifications</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="storage_gb">Storage (GB)</label>
                <input
                  id="storage_gb"
                  type="number"
                  min="0"
                  value={formData.storage_gb || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    storage_gb: e.target.value ? parseInt(e.target.value) : undefined,
                  })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ram_gb">RAM (GB)</label>
                <input
                  id="ram_gb"
                  type="number"
                  min="0"
                  value={formData.ram_gb || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ram_gb: e.target.value ? parseInt(e.target.value) : undefined,
                  })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="battery_mah">Battery (mAh)</label>
                <input
                  id="battery_mah"
                  type="number"
                  min="0"
                  value={formData.battery_mah || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    battery_mah: e.target.value ? parseInt(e.target.value) : undefined,
                  })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {selectedProductType === 'LT' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="processor_details">Processor Details</label>
                  <input
                    id="processor_details"
                    type="text"
                    value={formData.processor_details || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      processor_details: e.target.value,
                    })}
                    disabled={isLoading}
                    placeholder="e.g., Intel Core i5, Apple M1"
                  />
                </div>
              </div>
            )}

            {(selectedProductType === 'TB' || selectedProductType === 'PH') && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="is_sim_enabled">
                    <input
                      id="is_sim_enabled"
                      type="checkbox"
                      checked={formData.is_sim_enabled || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_sim_enabled: e.target.checked,
                      })}
                      disabled={isLoading}
                    />
                    {' '}SIM/Cellular Enabled
                  </label>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_sourced">Date Sourced</label>
                <input
                  id="date_sourced"
                  type="date"
                  value={(() => {
                    // Convert date_sourced to YYYY-MM-DD format for display
                    if (!formData.date_sourced) return '';
                    if (typeof formData.date_sourced === 'string') {
                      // Extract date part if it's a datetime string
                      return formData.date_sourced.includes('T') 
                        ? formData.date_sourced.split('T')[0] 
                        : formData.date_sourced;
                    }
                    // If it's a Date object, convert to YYYY-MM-DD
                    try {
                      return new Date(formData.date_sourced).toISOString().split('T')[0];
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    // Update immediately with the selected date value
                    const selectedDate = e.target.value;
                    setFormData({
                      ...formData,
                      date_sourced: selectedDate || undefined,
                    });
                  }}
                  onBlur={(e) => {
                    // Ensure date is formatted correctly on blur
                    const dateValue = e.target.value;
                    if (dateValue) {
                      setFormData(prev => ({
                        ...prev,
                        date_sourced: dateValue.split('T')[0], // Ensure YYYY-MM-DD format
                      }));
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Compatible devices for accessories are in the variant table above */}
          </div>

          <div className="form-subsection">
            <h3>Pricing</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="selling_price">
                  Selling Price <span className="required">*</span>
                </label>
                <input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.selling_price || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    selling_price: e.target.value || '0',
                  })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cost_of_unit">Cost of Unit</label>
                <input
                  id="cost_of_unit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_of_unit || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    cost_of_unit: e.target.value || '0',
                  })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-subsection">
            <h3>Source Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Source Type</label>
                <select
                  id="source"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as SourceEnum | undefined })}
                  disabled={isLoading}
                >
                  <option value="">Select source type</option>
                  <option value="SU">Supplier (SU)</option>
                  <option value="IM">Import (IM)</option>
                  <option value="BB">Buyback (BB)</option>
                </select>
                {formData.source === 'BB' && (
                  <small className="form-help">
                    Buyback items will require admin approval before becoming available for sale.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="acquisition_source_details_id">
                  Acquisition Source
                  {(formData.source === 'SU' || formData.source === 'IM') && (
                    <span className="required"> *</span>
                  )}
                </label>
                <select
                  id="acquisition_source_details_id"
                  value={formData.acquisition_source_details_id || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    acquisition_source_details_id: e.target.value ? parseInt(e.target.value) : undefined,
                  })}
                  required={formData.source === 'SU' || formData.source === 'IM'}
                  disabled={isLoading || formData.source === 'BB'}
                >
                  <option value="">Select source</option>
                  {sourcesData?.results?.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
                {(formData.source === 'SU' || formData.source === 'IM') && (
                  <small className="form-help">
                    Required when source type is Supplier or Import.
                  </small>
                )}
                {formData.source === 'BB' && (
                  <small className="form-help">
                    Not required for Buyback sources.
                  </small>
                )}
              </div>
            </div>
          </div>

          {!isAccessory && (
          <div className="form-subsection">
            <h3>Unit Images</h3>
            <div className="form-group">
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
            {unit?.id && existingImages && existingImages.results && existingImages.results.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {existingImages.results.map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                      <img 
                        src={img.image_url || img.image} 
                        alt="Unit" 
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
              {selectedImages.length > 0 && !unit?.id && (
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {selectedImages.length} image(s) selected. They will be uploaded when you create the unit.
                </div>
              )}
              {selectedImages.length > 0 && unit?.id && (
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
              {unit?.id 
                ? <>Choose files above, then click <strong>Upload Images</strong> to attach them. The <strong>Update</strong> button only saves unit details (price, source, etc.), not the selected files. The first image will be set as primary.</> 
                : 'Select images to upload. They will be attached when you create the unit. The first image will be set as primary.'}
              </small>
            </div>
          </div>
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
              {isLoading ? 'Saving...' : unit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

