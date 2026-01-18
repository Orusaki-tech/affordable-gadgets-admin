import type { ProductImage } from './ProductImage';
export type PaginatedProductImageList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ProductImage>;
};
