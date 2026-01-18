import type { PromotionType } from './PromotionType';
export type PaginatedPromotionTypeList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PromotionType>;
};
