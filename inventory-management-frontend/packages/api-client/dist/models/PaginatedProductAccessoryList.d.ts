import type { ProductAccessory } from './ProductAccessory';
export type PaginatedProductAccessoryList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ProductAccessory>;
};
