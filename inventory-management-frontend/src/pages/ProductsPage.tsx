import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ProductTemplate,
  Promotion,
  Brand,
  ProductsService,
  ProfilesService,
  ReservationRequestsService,
  PromotionsService,
} from '../api/index';
import { ProductForm } from '../components/ProductForm';
import { ProductStockSummaryModal } from '../components/ProductStockSummaryModal';
import { ProductPromotionModal } from '../components/ProductPromotionModal';
import { useAuth } from '../contexts/AuthContext';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';
import { useDebounce } from '../hooks/useDebounce';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    product_type: '',
    brand: '',
    stock_status: '',
    seo_status: '', // For Content Creators: 'all', 'complete', 'incomplete', 'missing-seo'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stockSummaryProductId, setStockSummaryProductId] = useState<number | null>(null);
  
  // Promotion management state (for Marketing Managers)
  const [selectedProductsForPromotion, setSelectedProductsForPromotion] = useState<Set<number>>(new Set());
  const [showPromotionModal, setShowPromotionModal] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionMode, setPromotionMode] = useState<'create' | 'attach' | 'edit'>('create');
  const [productForPromotion, setProductForPromotion] = useState<number | null>(null); // Single product ID when adding from card
  
  // Reservation state (for salespersons)
  const [reservationMode, setReservationMode] = useState<boolean>(false);
  const [selectedProductsForReservation, setSelectedProductsForReservation] = useState<Set<number>>(new Set());
  const [showReservationModal, setShowReservationModal] = useState<boolean>(false);
  const [productQuantities, setProductQuantities] = useState<Map<number, number>>(new Map()); // productId -> quantity
  const [reservationNotes, setReservationNotes] = useState<string>('');
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch admin profile to check roles
  const { data: adminProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: true, // Always enabled
  });

  const hasRole = useCallback((roleName: string) => {
    if (!adminProfile?.roles || adminProfile.roles.length === 0) return false;
    return adminProfile.roles.some((role) => {
      // Check both name and role_code fields (name is the role code like 'MM', 'SP', etc.)
      const roleCode = role.name || role.role_code;
      const roleNameCheck = role.display_name || role.role_name;
      // Check exact match for role code (e.g., 'MM') or case-insensitive match for display name
      return roleCode === roleName || 
             roleNameCheck?.toLowerCase() === roleName.toLowerCase() ||
             roleNameCheck?.toLowerCase().includes(roleName.toLowerCase());
    });
  }, [adminProfile]);

  const isSuperuser = adminProfile?.user?.is_superuser === true;
  const isSalesperson = hasRole('SP') && !isSuperuser;
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isMarketingManager = hasRole('MM') && !isSuperuser;
  const isInventoryManager = hasRole('IM') && !isSuperuser;
  
  // Debug: Log role detection (remove in production)
  useEffect(() => {
    if (adminProfile && !isLoadingProfile) {
      console.log('Admin Profile:', adminProfile);
      console.log('Roles:', adminProfile.roles);
      console.log('Is Marketing Manager:', isMarketingManager);
      console.log('Has MM role:', hasRole('MM'));
    }
  }, [adminProfile, isLoadingProfile, isMarketingManager, hasRole]);
  const canCreateProducts = isSuperuser || isInventoryManager;
  const canDeleteProducts = isSuperuser || isInventoryManager;

  const debouncedSearch = useDebounce(search, 300);
  const normalizedSearch = debouncedSearch.trim();

  // Use paginated products hook
  const { products: allProducts, isLoading, error, hasMore: hasMorePages, totalCount, loadMore } = usePaginatedProducts({
    search: normalizedSearch,
    productType: filters.product_type,
    brand: filters.brand,
    stockStatus: filters.stock_status,
    seoStatus: filters.seo_status,
  });

  // Create data object compatible with existing code
  const data = useMemo(() => ({
    results: allProducts,
    count: totalCount,
    next: hasMorePages ? 'has-more' : null,
    previous: null,
  }), [allProducts, totalCount, hasMorePages]);

  // Create a map of product IDs to stock summaries (lazy loading)
  const [stockSummaries, setStockSummaries] = useState<Record<number, { available_stock: number; min_price?: number; max_price?: number }>>({});
  // Track image loading states per product
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, { loading: boolean; error: boolean }>>({});
  
  // Fetch all promotions for Marketing Managers
  const { data: promotionsData } = useQuery({
    queryKey: ['promotions-all'],
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
    enabled: isMarketingManager, // Only fetch for Marketing Managers
  });
  
  // Create a map of product IDs to their promotions
  const productPromotionsMap = useMemo(() => {
    if (!promotionsData) return {};
    
    const map: Record<number, Promotion[]> = {};
    promotionsData.forEach((promotion) => {
      if (promotion.products && promotion.products.length > 0) {
        promotion.products.forEach((productId) => {
          if (!map[productId]) {
            map[productId] = [];
          }
          map[productId].push(promotion);
        });
      }
    });
    
    return map;
  }, [promotionsData]);
  
  // Get active promotions for a product
  const getActivePromotionsForProduct = (productId: number | undefined): Promotion[] => {
    if (!productId || !productPromotionsMap[productId]) return [];
    const now = new Date();
    return productPromotionsMap[productId].filter((promo) => {
      if (!promo.is_active) return false;
      if (promo.start_date && new Date(promo.start_date) > now) return false;
      if (promo.end_date && new Date(promo.end_date) < now) return false;
      return true;
    });
  };

  // Get admin brands for promotion modal
  const adminBrands = useMemo(() => {
    const brands = (adminProfile as any)?.brands || [];
    return brands.filter((b: Brand) => b.id !== undefined);
  }, [adminProfile]);

  // Promotion management handlers
  const handleAddPromotionToProduct = (productId: number) => {
    setProductForPromotion(productId);
    setPromotionMode('create');
    setShowPromotionModal(true);
  };

  const handleBulkAddPromotion = () => {
    if (selectedProductsForPromotion.size === 0) {
      alert('Please select at least one product');
      return;
    }
    setProductForPromotion(null);
    setPromotionMode('create');
    setShowPromotionModal(true);
  };

  const handleManagePromotions = (productId: number) => {
    const activePromotions = getActivePromotionsForProduct(productId);
    if (activePromotions.length === 0) {
      handleAddPromotionToProduct(productId);
    } else {
      // Show a list of promotions for this product
      const promotionList = activePromotions.map(p => p.title).join(', ');
      if (window.confirm(`This product has ${activePromotions.length} active promotion(s): ${promotionList}\n\nWould you like to add another promotion?`)) {
        handleAddPromotionToProduct(productId);
      }
    }
  };

  const handlePromotionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['promotions-all'] });
    queryClient.invalidateQueries({ queryKey: ['promotions-all-for-attach'] });
    setSelectedProductsForPromotion(new Set());
    setProductForPromotion(null);
  };

  const toggleProductSelectionForPromotion = (productId: number) => {
    setSelectedProductsForPromotion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };
  
  // Fetch stock summary for a product (lazy load on hover or when needed)
  const fetchStockSummary = async (productId: number) => {
    if (!productId || productId <= 0) return;
    if (stockSummaries[productId]) return; // Already fetched
    
    try {
      const summary = await ProductsService.productsStockSummaryRetrieve(productId);
      setStockSummaries(prev => ({
        ...prev,
        [productId]: {
          available_stock: (summary as any).available_stock || 0,
          min_price: (summary as any).min_price,
          max_price: (summary as any).max_price,
        }
      }));
    } catch (err) {
      // Silently fail - stock info is optional
      console.error('Failed to fetch stock summary:', err);
    }
  };

  // Helper function to get stock status
  const getStockStatus = (product: ProductTemplate, availableStock?: number | null) => {
    if (availableStock === undefined || availableStock === null) return null;
    
    const available = availableStock || 0;
    const minThreshold = (product as any).min_stock_threshold;
    const isDiscontinued = (product as any).is_discontinued;
    
    if (isDiscontinued) {
      return { status: 'discontinued', label: 'Discontinued', color: '#6c757d' };
    }
    
    if (available === 0) {
      return { status: 'out_of_stock', label: 'Out of Stock', color: '#dc3545' };
    }
    
    if (minThreshold && available < minThreshold) {
      return { status: 'low_stock', label: 'Low Stock', color: '#ff9800' };
    }
    
    return { status: 'in_stock', label: 'In Stock', color: '#28a745' };
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ProductsService.productsDestroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-all'] });
      alert('Product deleted successfully');
    },
    onError: (err: any) => {
      // #region agent log
      const errorInfo = {
        hasResponse: !!err?.response,
        hasData: !!err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        dataType: typeof err?.response?.data,
        data: err?.response?.data,
        message: err?.message,
        fullError: err,
      };
      fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductsPage.tsx:292',message:'Product delete error caught',data:errorInfo,timestamp:Date.now(),sessionId:'debug-session',runId:'product-delete-error-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Extract error message from DRF ValidationError response
      let errorMessage = 'Unknown error';
      
      // Check response.data first (most common for API errors)
      if (err?.response?.data) {
        const data = err.response.data;
        // DRF ValidationError can return string, object, or array
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data) && data.length > 0) {
          // DRF sometimes returns errors as arrays
          errorMessage = typeof data[0] === 'string' ? data[0] : JSON.stringify(data[0]);
        } else if (typeof data === 'object') {
          // Try to extract first meaningful error value
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
        // Only use err.message if it's not just the status text
        errorMessage = err.message;
      } else if (err?.response?.statusText && err.response.statusText !== 'Bad Request') {
        errorMessage = err.response.statusText;
      }
      
      alert(`Failed to delete product: ${errorMessage}`);
    },
  });

  const handleDelete = (product: ProductTemplate) => {
    if (!product.id) return;
    if (!canDeleteProducts) {
      if (isContentCreator) {
        alert('Content Creators cannot delete products. They can only edit products.');
      } else if (isMarketingManager) {
        alert('Marketing Managers cannot delete products. They can only view products and attach promotions.');
      } else if (isSalesperson) {
        alert('Salespersons cannot delete products.');
      } else {
        alert('You do not have permission to delete products.');
      }
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleEdit = (product: ProductTemplate) => {
    if (isMarketingManager) {
      alert('Marketing Managers cannot edit products. They can only view products and attach promotions via the Promotions page.');
      return;
    }
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    // Clear edit parameter from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('edit');
    setSearchParams(newSearchParams, { replace: true });
  };

  // Handle URL params for edit action
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && data?.results) {
      const product = data.results.find((p: ProductTemplate) => p.id === parseInt(editId));
      if (product) {
        handleEdit(product);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data]);

  // Reservation functionality for salespersons
  const toggleProductSelection = (productId: number) => {
    if (!reservationMode) return;
    const newSelected = new Set(selectedProductsForReservation);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductsForReservation(newSelected);
  };

  const handleStartReservation = () => {
    setReservationMode(true);
    setSelectedProductsForReservation(new Set());
  };

  const handleCancelReservation = () => {
    setReservationMode(false);
    setSelectedProductsForReservation(new Set());
    setShowReservationModal(false);
    setProductQuantities(new Map());
    setReservationNotes('');
  };

  const handleOpenReservationModal = () => {
    if (selectedProductsForReservation.size === 0) {
      alert('Please select at least one product to reserve');
      return;
    }
    setShowReservationModal(true);
  };

  // Fetch available units for selected products
  const { data: availableUnitsData, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['available-units-for-products', Array.from(selectedProductsForReservation)],
    queryFn: async () => {
      const productIds = Array.from(selectedProductsForReservation);
      
      console.log('🔍 Fetching available units for products:', productIds);
      
      if (productIds.length === 0) {
        return { results: [] };
      }
      
      try {
        // Fetch units for each product using server-side filtering
        const allUnits: any[] = [];
        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/inventory';
        
        // Fetch units for each selected product with server-side filtering
        for (const productId of productIds) {
          let currentPage = 1;
          let hasMore = true;
          
          while (hasMore) {
            // Use API filtering: filter by product_template AND sale_status=AV
            const url = `${baseUrl}/units/?product_template=${productId}&sale_status=AV&page=${currentPage}&page_size=100`;
            
            console.log(`🔄 Fetching units for product ${productId}, page ${currentPage}...`);
            
            const response = await fetch(url, {
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              if (response.status === 401 || response.status === 403) {
                console.error('❌ Authentication error:', response.status);
                throw new Error('Authentication required or invalid.');
              }
              throw new Error(`Failed to fetch units: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.results && result.results.length > 0) {
              console.log(`✅ Product ${productId}, page ${currentPage}: Found ${result.results.length} available units`);
              allUnits.push(...result.results);
              hasMore = !!result.next;
              currentPage++;
            } else {
              hasMore = false;
            }
          }
        }
        
        console.log(`🎯 Total available units for all selected products:`, allUnits.length);
        if (allUnits.length > 0) {
          console.log('📊 Sample units:', allUnits.slice(0, 3).map((u: any) => ({
            id: u.id,
            product: (u as any).product_template || u.product_template_id,
            status: u.sale_status,
            serial: u.serial_number,
          })));
        } else {
          console.log('⚠️ No available units found. Check:');
          console.log('   - Units may have different sale_status (not AV)');
          console.log('   - Units may belong to different products');
          console.log('   - No units exist for these products');
        }
        
        return { results: allUnits };
      } catch (error: any) {
        console.error('❌ Error fetching units:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
        });
        return { results: [] };
      }
    },
    enabled: showReservationModal && selectedProductsForReservation.size > 0,
  });

  // Group units by product
  const groupedUnitsByProduct = useMemo(() => {
    if (!availableUnitsData?.results) {
      console.log('⚠️ No available units data to group');
      return {};
    }
    
    console.log('📦 Grouping units. Total units:', availableUnitsData.results.length);
    
    const grouped: { [key: number]: any[] } = {};
    availableUnitsData.results.forEach((unit: any) => {
      // product_template is the read-only ID field, product_template_id is write-only
      // Using 'as any' because TypeScript types haven't been regenerated yet
      const productId = (unit as any).product_template || unit.product_template_id;
      if (!productId) {
        console.warn('⚠️ Unit missing product ID:', unit);
        return;
      }
      if (!grouped[productId]) {
        grouped[productId] = [];
      }
      grouped[productId].push(unit);
    });
    
    console.log('📊 Grouped units by product:', Object.keys(grouped).map(k => ({
      productId: k,
      unitCount: grouped[Number(k)].length,
    })));
    
    return grouped;
  }, [availableUnitsData]);

  const updateProductQuantity = (productId: number, quantity: number) => {
    const newQuantities = new Map(productQuantities);
    if (quantity <= 0) {
      newQuantities.delete(productId);
    } else {
      newQuantities.set(productId, quantity);
    }
    setProductQuantities(newQuantities);
  };

  const createReservationMutation = useMutation({
    mutationFn: async (data: { inventory_unit_id: number; notes?: string }) => {
      console.log('📝 Creating reservation request with data:', data);
      try {
        const result = await ReservationRequestsService.reservationRequestsCreate({
          inventory_unit_id: data.inventory_unit_id,
          notes: data.notes || '',
        });
        console.log('✅ Reservation request created successfully:', result);
        return result;
      } catch (error: any) {
        console.error('❌ Reservation request creation failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          body: error.body,
          response: error.response,
        });
        
        // Extract detailed error message from response body
        let detailedMessage = error.message || 'Validation or input error';
        if (error.body) {
          if (typeof error.body === 'object') {
            // DRF validation errors are usually in error.body
            const errorDetails = Object.entries(error.body)
              .map(([field, messages]: [string, any]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              })
              .join('; ');
            if (errorDetails) {
              detailedMessage = errorDetails;
            } else {
              detailedMessage = JSON.stringify(error.body);
            }
          } else {
            detailedMessage = String(error.body);
          }
        }
        
        // Create a new error with the detailed message
        const detailedError = new Error(detailedMessage);
        (detailedError as any).status = error.status;
        (detailedError as any).body = error.body;
        (detailedError as any).originalError = error;
        throw detailedError;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch all reservation request queries (including all filter variations)
      queryClient.invalidateQueries({ queryKey: ['reservation-requests'] });
      queryClient.refetchQueries({ queryKey: ['reservation-requests'] });
      // Also invalidate dashboard pending requests query
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.refetchQueries({ queryKey: ['pending-requests'] });
    },
    onError: (err: any) => {
      console.error('Failed to create reservation:', err);
    },
  });

  const handleReserveSelected = async () => {
    // Calculate total quantity
    const totalQuantity = Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0);
    
    if (totalQuantity === 0) {
      alert('Please select at least one unit to reserve');
      return;
    }
    
    // Get units to reserve: for each product, take the first N available units
    const unitsToReserve: number[] = [];
    
    for (const [productId, quantity] of productQuantities.entries()) {
      const units = groupedUnitsByProduct[productId] || [];
      const unitsToTake = units.slice(0, quantity).map((u: any) => u.id);
      
      if (unitsToTake.length < quantity) {
        const product = data?.results?.find(p => p.id === productId);
        alert(`Only ${unitsToTake.length} available unit(s) for "${product?.product_name || `Product #${productId}`}". Requesting ${unitsToTake.length} instead of ${quantity}.`);
      }
      
      unitsToReserve.push(...unitsToTake);
    }
    
    if (unitsToReserve.length === 0) {
      alert('No units available to reserve');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const unitId of unitsToReserve) {
      try {
        console.log(`🔄 Attempting to reserve unit ID: ${unitId}`);
        await createReservationMutation.mutateAsync({
          inventory_unit_id: unitId,
          notes: reservationNotes,
        });
        successCount++;
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Failed to reserve unit ${unitId}:`, error);
        
        // Extract and log detailed error message
        let errorMessage = 'Unknown error';
        if (error.message && error.message !== 'Validation or input error') {
          errorMessage = error.message;
        } else if (error.body) {
          if (typeof error.body === 'object') {
            const errorDetails = Object.entries(error.body)
              .map(([field, messages]: [string, any]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              })
              .join('; ');
            errorMessage = errorDetails || JSON.stringify(error.body);
          } else {
            errorMessage = String(error.body);
          }
        } else if (error.originalError?.body) {
          if (typeof error.originalError.body === 'object') {
            errorMessage = JSON.stringify(error.originalError.body);
          } else {
            errorMessage = String(error.originalError.body);
          }
        }
        
        console.error(`❌ Error message for unit ${unitId}:`, errorMessage);
        console.error('❌ Full error object:', error);
      }
    }
    
    if (successCount > 0) {
      alert(`Successfully created ${successCount} reservation request${successCount > 1 ? 's' : ''}`);
      handleCancelReservation();
    }
    
    if (errorCount > 0) {
      // Try to get a more specific error message from the last error
      let errorMessage = errorCount === 1 && unitsToReserve.length === 1 
        ? 'Failed to create reservation request.'
        : `Failed to create ${errorCount} request${errorCount > 1 ? 's' : ''}.`;
      
      // Add note to check console for details
      errorMessage += ' Check console for details.';
      
      alert(errorMessage);
    }
  };

  const handleCreate = () => {
    if (!canCreateProducts) {
      if (isContentCreator) {
        alert('Content Creators can only edit existing products.');
      } else if (isMarketingManager) {
        alert('Marketing Managers cannot create products. They can only view products and attach promotions.');
      } else if (isSalesperson) {
        alert('Salespersons cannot create products.');
      } else {
        alert('You do not have permission to create products.');
      }
      return;
    }
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    // Invalidate and refetch to show the newly created product immediately
    queryClient.invalidateQueries({ queryKey: ['products-all'] });
    queryClient.refetchQueries({ queryKey: ['products-all'] });
  };

  // Handle URL params for edit action
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && data?.results && !editingProduct) {
      const product = data.results.find((p: ProductTemplate) => p.id === parseInt(editId));
      if (product) {
        handleEdit(product);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data]);

  // Get unique brands and product types for filter dropdowns
  const uniqueBrands = useMemo(() => {
    if (!data?.results) return [];
    const brands = new Set<string>();
    data.results.forEach(product => {
      if (product.brand) brands.add(product.brand);
    });
    return Array.from(brands).sort();
  }, [data]);

  const productTypes = [
    { value: '', label: 'All Types' },
    { value: 'PH', label: 'Phone' },
    { value: 'LT', label: 'Laptop' },
    { value: 'TB', label: 'Tablet' },
    { value: 'AC', label: 'Accessory' },
  ];

  const stockStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  // Server handles search/type/brand/stock/SEO filtering
  const filteredProducts = useMemo(() => {
    if (!data?.results) return [];
    
    return data.results.filter((product) => {
      return true;
    });
  }, [data]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.product_type) count++;
    if (filters.brand) count++;
    if (filters.stock_status) count++;
    if (isContentCreator && filters.seo_status) count++;
    return count;
  }, [filters, isContentCreator]);

  const clearFilters = () => {
    setFilters({
      product_type: '',
      brand: '',
      stock_status: '',
      seo_status: '',
    });
    setSearch('');
  };

  // Show error only if we have no products loaded
  if (error && allProducts.length === 0) {
    return <div className="error">Error loading products: {error.message}</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <div className="page-header-actions">
          {isMarketingManager && (
            <>
              {selectedProductsForPromotion.size === 0 ? (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setProductForPromotion(null);
                    setPromotionMode('create');
                    setShowPromotionModal(true);
                  }}
                >
                  Add Promotion
                </button>
              ) : (
                <>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setSelectedProductsForPromotion(new Set())}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Cancel ({selectedProductsForPromotion.size} selected)
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleBulkAddPromotion}
                  >
                    Add Promotion to {selectedProductsForPromotion.size} Product{selectedProductsForPromotion.size !== 1 ? 's' : ''}
                  </button>
                </>
              )}
            </>
          )}
          {isSalesperson && (
            <>
              {!reservationMode ? (
                <button className="btn-primary" onClick={handleStartReservation}>
                  Reserve Products
                </button>
              ) : (
                <>
                  <button 
                    className="btn-secondary" 
                    onClick={handleCancelReservation}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleOpenReservationModal}
                    disabled={selectedProductsForReservation.size === 0}
                  >
                    Reserve Selected ({selectedProductsForReservation.size})
                  </button>
                </>
              )}
            </>
          )}
          <button
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            style={{ marginLeft: '0.5rem' }}
          >
            <span>🔍 Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
        {canCreateProducts && (
          <button className="btn-primary" onClick={handleCreate} style={{ marginLeft: '0.5rem' }}>
            + Create Product
          </button>
        )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-row">
        <input
          type="text"
            placeholder="Search products by name, brand, model, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
          {(search || activeFilterCount > 0) && (
            <button
              className="btn-clear-filters"
              onClick={clearFilters}
            >
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <>
            {/* Desktop: Inline filters */}
            <div className="filters-panel filters-panel-desktop">
              <div className="filter-group">
                <label htmlFor="filter-product-type">Product Type</label>
                <select
                  id="filter-product-type"
                  value={filters.product_type}
                  onChange={(e) => setFilters({ ...filters, product_type: e.target.value })}
                  className="filter-select"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-brand">Brand</label>
                <select
                  id="filter-brand"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="filter-select"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-stock-status">Stock Status</label>
                <select
                  id="filter-stock-status"
                  value={filters.stock_status}
                  onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
                  className="filter-select"
                >
                  {stockStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              {isContentCreator && (
                <div className="filter-group">
                  <label htmlFor="filter-seo-status">SEO Status</label>
                  <select
                    id="filter-seo-status"
                    value={filters.seo_status}
                    onChange={(e) => setFilters({ ...filters, seo_status: e.target.value })}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    <option value="missing-seo">Missing SEO</option>
                    <option value="incomplete">Incomplete (Low Score)</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              )}
            </div>

            {/* Mobile: Modal overlay */}
            <div className="filters-modal-overlay" onClick={() => setShowFilters(false)}>
              <div className="filters-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="filters-modal-header">
                  <h2>Filters</h2>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                  >
                    ×
                  </button>
                </div>
                <div className="filters-panel filters-panel-mobile">
                  <div className="filter-group">
                    <label htmlFor="filter-product-type-mobile">Product Type</label>
                    <select
                      id="filter-product-type-mobile"
                      value={filters.product_type}
                      onChange={(e) => setFilters({ ...filters, product_type: e.target.value })}
                      className="filter-select"
                    >
                      {productTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-brand-mobile">Brand</label>
                    <select
                      id="filter-brand-mobile"
                      value={filters.brand}
                      onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                      className="filter-select"
                    >
                      <option value="">All Brands</option>
                      {uniqueBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-stock-status-mobile">Stock Status</label>
                    <select
                      id="filter-stock-status-mobile"
                      value={filters.stock_status}
                      onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
                      className="filter-select"
                    >
                      {stockStatusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  {isContentCreator && (
                    <div className="filter-group">
                      <label htmlFor="filter-seo-status-mobile">SEO Status</label>
                      <select
                        id="filter-seo-status-mobile"
                        value={filters.seo_status}
                        onChange={(e) => setFilters({ ...filters, seo_status: e.target.value })}
                        className="filter-select"
                      >
                        <option value="">All</option>
                        <option value="missing-seo">Missing SEO</option>
                        <option value="incomplete">Incomplete (Low Score)</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="filters-modal-footer">
                  <button 
                    className="btn-secondary" 
                    onClick={clearFilters}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Clear All
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3>No Products Found</h3>
          <p>
            {(search || activeFilterCount > 0) 
              ? 'Try adjusting your search terms or filters' 
              : 'Get started by creating your first product'}
          </p>
          {(search || activeFilterCount > 0) && (
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            // Get first image URL from ProductImageSerializer (has image_url field)
            // images is typed as string but actually returns an array from the API
            const imagesArray = typeof product.images === 'string' ? (product.images ? JSON.parse(product.images) : []) : (product.images as any);
            const firstImage = Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
            const imageUrl = firstImage 
              ? (firstImage.image_url || firstImage.image || (typeof firstImage === 'string' ? firstImage : null))
              : null;
            const fullImageUrl = imageUrl 
              ? (imageUrl.startsWith('http') || imageUrl.startsWith('//') 
                  ? imageUrl 
                  : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
              : null;

            const stockSummary = product.id ? stockSummaries[product.id] : undefined;
            const availableStock = stockSummary?.available_stock ?? (product as any).available_stock;
            const hasStockInfo = availableStock !== undefined && availableStock !== null;
            const stockStatus = getStockStatus(product, availableStock);
            const imageState = product.id ? (imageLoadingStates[product.id] || { loading: !!fullImageUrl, error: false }) : { loading: false, error: true };
            const imageLoading = imageState.loading;
            const imageError = imageState.error;
            
            const handleImageLoad = () => {
              if (product.id) {
                setImageLoadingStates(prev => ({
                  ...prev,
                  [product.id!]: { loading: false, error: false }
                }));
              }
            };
            
            const handleImageError = () => {
              if (product.id) {
                setImageLoadingStates(prev => ({
                  ...prev,
                  [product.id!]: { loading: false, error: true }
                }));
              }
            };

            const activePromotions = getActivePromotionsForProduct(product.id);
            const hasActivePromotions = activePromotions.length > 0;
            const isSelectedForPromotion = isMarketingManager && product.id && selectedProductsForPromotion.has(product.id);

            return (
              <div 
                key={product.id} 
                className={`product-card ${reservationMode && selectedProductsForReservation.has(product.id!) ? 'card-selected' : ''} ${isSelectedForPromotion ? 'card-selected' : ''}`}
                onClick={() => {
                  if (reservationMode && product.id) {
                    toggleProductSelection(product.id);
                  } else if (isMarketingManager && selectedProductsForPromotion.size > 0 && product.id) {
                    // In selection mode - toggle selection
                    toggleProductSelectionForPromotion(product.id);
                  } else if (product.id) {
                    // Navigate to product units (for all roles when not in selection mode)
                    navigate(`/products/${product.id}/units`);
                  }
                }}
                onMouseEnter={() => product.id && fetchStockSummary(product.id)}
              >
                {/* Bulk selection checkbox for Marketing Managers */}
                {isMarketingManager && product.id && (
                  <div className="card-checkbox-overlay" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedProductsForPromotion.has(product.id)}
                      onChange={() => product.id && toggleProductSelectionForPromotion(product.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                  </div>
                )}
                {/* Reservation mode checkbox for Salespersons */}
                {reservationMode && product.id && (
                  <div className="card-checkbox-overlay" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedProductsForReservation.has(product.id)}
                      onChange={() => {
                        if (product.id) {
                          toggleProductSelection(product.id);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                    />
                  </div>
                )}
                <div className="product-card-image">
                  {fullImageUrl && !imageError ? (
                    <>
                      {imageLoading && (
                        <div className="image-loading-overlay">
                          <div className="image-loading-spinner"></div>
                        </div>
                      )}
                    <img 
                      src={fullImageUrl} 
                      alt={product.product_name || 'Product image'} 
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ opacity: imageLoading ? 0 : 1 }}
                      />
                    </>
                  ) : (
                    <div className="product-card-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  {product.images && product.images.length > 1 && (
                    <div className="image-count-badge">
                      +{product.images.length - 1}
                    </div>
                  )}
                  {stockStatus && (
                    <div 
                      className="stock-status-badge"
                      style={{ backgroundColor: stockStatus.color }}
                    >
                      {stockStatus.label}
                    </div>
                  )}
                  {/* Promotion indicator badge */}
                  {hasActivePromotions && (
                    <div 
                      className="promotion-badge"
                      title={`${activePromotions.length} active promotion${activePromotions.length !== 1 ? 's' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.id) {
                          handleManagePromotions(product.id);
                        }
                      }}
                    >
                      🎯 {activePromotions.length}
                    </div>
                  )}
                </div>
                <div className="product-card-content">
                  <div className="product-card-header">
                  <h3 className="product-card-name">{product.product_name || 'Unnamed Product'}</h3>
                    <div className={`product-stock-info ${!hasStockInfo && !stockSummary ? 'product-stock-info-empty' : ''}`}>
                      {hasStockInfo && (
                        <>
                          <span className="stock-count">{availableStock || 0} available</span>
                          {stockSummary?.min_price != null && stockSummary?.max_price != null && stockSummary.min_price > 0 && stockSummary.max_price > 0 && stockSummary.min_price === stockSummary.max_price && (
                            <span className="stock-price">KES {stockSummary.min_price.toLocaleString()}</span>
                          )}
                          {stockSummary?.min_price != null && stockSummary?.max_price != null && stockSummary.min_price > 0 && stockSummary.max_price > 0 && stockSummary.min_price !== stockSummary.max_price && (
                            <span className="stock-price">KES {stockSummary.min_price.toLocaleString()} - {stockSummary.max_price.toLocaleString()}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="product-card-details">
                    <div className="product-card-detail-item">
                      <span className="detail-label">Brand:</span>
                      <span className="detail-value">{product.brand || '-'}</span>
                    </div>
                    <div className="product-card-detail-item">
                      <span className="detail-label">Model:</span>
                      <span className="detail-value">{product.model_series || '-'}</span>
                    </div>
                  </div>
                  <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-small btn-info"
                      onClick={() => product.id && setStockSummaryProductId(product.id)}
                      title="View stock summary"
                    >
                      Stock
                    </button>
                    <button
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(product)}
                      title="Edit product"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(product)}
                      disabled={deleteMutation.isPending || !canDeleteProducts}
                      title={canDeleteProducts ? 'Delete product' : 'You do not have permission to delete products'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination">
        <span className="page-info">
          Showing {filteredProducts.length} of {data?.count || 0} product{data?.count !== 1 ? 's' : ''}
          {(search || activeFilterCount > 0) && (
            <span className="filter-indicator"> (filtered)</span>
          )}
        </span>
        {hasMorePages && (
          <button
            className="btn-primary"
            onClick={loadMore}
            disabled={isLoading}
            style={{ marginTop: '1rem' }}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>

      {showCreateModal && !(isContentCreator && !editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {stockSummaryProductId && (
        <ProductStockSummaryModal
          productId={stockSummaryProductId}
          onClose={() => setStockSummaryProductId(null)}
        />
      )}

      {/* Promotion Modal for Marketing Managers */}
      {showPromotionModal && isMarketingManager && (
        <ProductPromotionModal
          productIds={
            productForPromotion 
              ? [productForPromotion]
              : Array.from(selectedProductsForPromotion)
          }
          onClose={() => {
            setShowPromotionModal(false);
            setEditingPromotion(null);
            setProductForPromotion(null);
          }}
          onSuccess={handlePromotionSuccess}
          adminBrands={adminBrands}
          mode={editingPromotion ? 'edit' : promotionMode}
          existingPromotion={editingPromotion}
        />
      )}

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="modal-overlay" onClick={handleCancelReservation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Select Quantities to Reserve</h2>
              <button className="modal-close" onClick={handleCancelReservation}>×</button>
            </div>
            
            <div className="modal-body">
              {isLoadingUnits ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem',
                  color: '#666'
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                  }}></div>
                  <div style={{ fontSize: '1rem', fontWeight: '500' }}>Loading available units...</div>
                </div>
              ) : availableUnitsData?.results === undefined ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem',
                  backgroundColor: '#fff3cd',
                  borderRadius: '8px',
                  border: '1px solid #ffc107',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <strong style={{ color: '#856404', display: 'block', marginBottom: '0.5rem' }}>Error loading units</strong>
                  <span style={{ fontSize: '0.875rem', color: '#856404' }}>
                    Please check the browser console for details. This might be a permission issue.
                  </span>
                </div>
              ) : (
                <>
                  <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#e7f5ff',
                    borderRadius: '8px',
                    border: '1px solid #b3d9ff'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#004085' }}>
                      <strong>📋 Selected Products:</strong> {Array.from(selectedProductsForReservation).length} product{Array.from(selectedProductsForReservation).length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {Array.from(selectedProductsForReservation).map((productId) => {
                    const product = data?.results?.find(p => p.id === productId);
                    const units = groupedUnitsByProduct[productId] || [];
                    const availableCount = units.length;
                    const currentQuantity = productQuantities.get(productId) || 0;
                    const maxQuantity = availableCount;
                    
                    return (
                      <div key={productId} style={{ 
                        marginBottom: '1.5rem', 
                        padding: '1.5rem',
                        border: '1px solid #dee2e6', 
                        borderRadius: '8px',
                        backgroundColor: '#ffffff'
                      }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              margin: 0,
                              marginBottom: '0.5rem',
                              fontSize: '1.1rem', 
                              fontWeight: '600',
                              color: '#212529',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>📦</span>
                              {product?.product_name || `Product #${productId}`}
                            </h3>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              color: '#6c757d'
                            }}>
                              {availableCount > 0 ? (
                                <span style={{ color: '#28a745', fontWeight: '500' }}>
                                  {availableCount} available unit{availableCount !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span style={{ color: '#dc3545' }}>No available units</span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <label style={{ 
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              color: '#495057'
                            }}>
                              Quantity:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={maxQuantity}
                              value={currentQuantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                const clampedValue = Math.max(0, Math.min(value, maxQuantity));
                                updateProductQuantity(productId, clampedValue);
                              }}
                              disabled={availableCount === 0}
                              style={{ 
                                width: '80px',
                                padding: '0.5rem',
                                border: '1px solid #ced4da',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                textAlign: 'center',
                                fontWeight: '500',
                                backgroundColor: availableCount === 0 ? '#f8f9fa' : '#ffffff',
                                cursor: availableCount === 0 ? 'not-allowed' : 'text'
                              }}
                            />
                            {currentQuantity > 0 && (
                              <span style={{ 
                                fontSize: '0.875rem',
                                color: '#28a745',
                                fontWeight: '500'
                              }}>
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {currentQuantity > maxQuantity && (
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            color: '#856404',
                            marginTop: '0.75rem'
                          }}>
                            ⚠️ You can only reserve up to {maxQuantity} unit{maxQuantity !== 1 ? 's' : ''} for this product.
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0) > 0 && (
                    <div style={{ 
                      marginTop: '2rem', 
                      paddingTop: '1.5rem', 
                      borderTop: '2px solid #e9ecef',
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.75rem', 
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        color: '#212529'
                      }}>
                        📝 Notes (Optional)
                      </label>
                      <textarea
                        value={reservationNotes}
                        onChange={(e) => setReservationNotes(e.target.value)}
                        rows={4}
                        style={{ 
                          width: '100%', 
                          padding: '0.875rem', 
                          border: '1px solid #ced4da', 
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.outline = 'none';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#ced4da';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Add any notes for these reservation requests (e.g., special handling instructions, customer requirements, etc.)..."
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="modal-footer" style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem', 
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button 
                className="btn-secondary" 
                onClick={handleCancelReservation}
                style={{
                  minWidth: '100px'
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleReserveSelected}
                disabled={Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0) === 0 || createReservationMutation.isPending}
                style={{
                  minWidth: '150px',
                  opacity: Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0) === 0 ? 0.6 : 1,
                  cursor: Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0) === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {createReservationMutation.isPending ? (
                  <>
                    <span style={{ display: 'inline-block', marginRight: '0.5rem' }}>⏳</span>
                    Creating...
                  </>
                ) : (
                  `Reserve ${Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0)} Unit${Array.from(productQuantities.values()).reduce((sum, qty) => sum + qty, 0) !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

