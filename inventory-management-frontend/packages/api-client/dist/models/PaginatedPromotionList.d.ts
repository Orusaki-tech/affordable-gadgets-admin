import type { Promotion } from './Promotion';
export type PaginatedPromotionList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Promotion>;
};
