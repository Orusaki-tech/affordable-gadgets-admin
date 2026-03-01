import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductsService, ProductTemplate, PaginatedProductList } from '../api/index';

interface UsePaginatedProductsOptions {
  enabled?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  search?: string;
  productType?: string;
  brand?: string;
  stockStatus?: string;
}

interface UsePaginatedProductsReturn {
  products: ProductTemplate[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  loadMore: () => void;
  reset: () => void;
  refetch: () => void;
}

/**
 * Reusable hook for paginated product fetching.
 * Only loads the first page initially, with "Load More" functionality.
 * 
 * @param options Configuration options
 * @returns Paginated products data and controls
 */
export const usePaginatedProducts = (
  options: UsePaginatedProductsOptions = {}
): UsePaginatedProductsReturn => {
  const {
    enabled = true,
    initialPage = 1,
    onPageChange,
    search = '',
    productType = '',
    brand = '',
    stockStatus = '',
  } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allProducts, setAllProducts] = useState<ProductTemplate[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const prevFilterKeyRef = useRef<string | null>(null);

  // Fetch products with pagination - only load current page
  const normalizedSearch = search.trim();

  const { data: pageData, isLoading, error, refetch } = useQuery<PaginatedProductList>({
    queryKey: ['products', currentPage, normalizedSearch, productType, brand, stockStatus],
    queryFn: async () => {
      return ProductsService.productsList({
        page: currentPage,
        search: normalizedSearch || undefined,
        product_type: productType || undefined,
        brand: brand || undefined,
        stock_status: stockStatus || undefined,
      });
    },
    enabled,
  });

  // Update accumulated products when new page data arrives
  useEffect(() => {
    if (pageData?.results) {
      if (currentPage === 1) {
        // First page - replace all products
        setAllProducts(pageData.results);
      } else {
        // Subsequent pages - append to existing products
        setAllProducts(prev => [...prev, ...pageData.results]);
      }
      setTotalCount(pageData.count || 0);
      setHasMorePages(!!pageData.next);
      
      if (onPageChange) {
        onPageChange(currentPage);
      }
    }
  }, [pageData, currentPage, onPageChange]);

  // Reset pagination only when user changes filters (not on mount or when navigating back)
  useEffect(() => {
    const filterKey = `${normalizedSearch}|${productType}|${brand}|${stockStatus}`;
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
      return;
    }
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      setCurrentPage(initialPage);
      setAllProducts([]);
      setHasMorePages(true);
      setTotalCount(0);
    }
  }, [initialPage, normalizedSearch, productType, brand, stockStatus]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!isLoading && hasMorePages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, hasMorePages]);

  // Reset to first page
  const reset = useCallback(() => {
    // Only reset if we're not already on the first page
    if (currentPage !== initialPage) {
      setCurrentPage(initialPage);
    }
    setAllProducts([]);
    setHasMorePages(true);
    setTotalCount(0);
  }, [initialPage, currentPage]);

  return {
    products: allProducts,
    isLoading,
    error: error as Error | null,
    hasMore: hasMorePages,
    totalCount,
    currentPage,
    loadMore,
    reset,
    refetch: () => {
      reset();
      refetch();
    },
  };
};

