import type { PublicProduct } from './PublicProduct';
export type PaginatedPublicProductList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicProduct>;
};
