import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductsService, ProductTemplate, PaginatedProductList } from '../api/index';

interface UsePaginatedProductsOptions {
  enabled?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
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
  const { enabled = true, initialPage = 1, onPageChange } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allProducts, setAllProducts] = useState<ProductTemplate[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch products with pagination - only load current page
  const { data: pageData, isLoading, error, refetch } = useQuery<PaginatedProductList>({
    queryKey: ['products', currentPage],
    queryFn: async () => {
      // #region agent log
      const fetchStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePaginatedProducts.ts:35',message:'Product page fetch started',data:{page:currentPage,timestamp:fetchStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'perf-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const pageCallStart = Date.now();
      const response = await ProductsService.productsList(currentPage);
      const pageCallEnd = Date.now();
      const pageDuration = pageCallEnd - pageCallStart;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b929b5de-6cb5-433f-9de2-1e9133201c78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePaginatedProducts.ts:45',message:'Product page fetched',data:{page:currentPage,productsInPage:response.results?.length||0,duration:pageDuration,hasNext:!!response.next,totalCount:response.count},timestamp:Date.now(),sessionId:'debug-session',runId:'perf-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      return response;
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

