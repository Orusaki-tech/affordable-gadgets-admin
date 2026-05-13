import type { FinancingOffer } from './FinancingOffer';
export type PaginatedFinancingOfferList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<FinancingOffer>;
};
