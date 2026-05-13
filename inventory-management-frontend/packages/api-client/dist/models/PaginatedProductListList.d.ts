import type { ProductList } from './ProductList';
export type PaginatedProductListList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ProductList>;
};
