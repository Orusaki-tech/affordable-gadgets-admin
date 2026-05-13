import type { PublicDeliveryRate } from './PublicDeliveryRate';
export type PaginatedPublicDeliveryRateList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicDeliveryRate>;
};
