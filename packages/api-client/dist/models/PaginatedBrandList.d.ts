import type { Brand } from './Brand';
export type PaginatedBrandList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Brand>;
};
