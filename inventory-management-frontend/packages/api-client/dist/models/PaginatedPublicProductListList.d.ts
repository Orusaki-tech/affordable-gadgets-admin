import type { PublicProductList } from './PublicProductList';
export type PaginatedPublicProductListList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicProductList>;
};
