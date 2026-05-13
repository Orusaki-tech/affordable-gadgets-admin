import type { DeliveryRate } from './DeliveryRate';
export type PaginatedDeliveryRateList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<DeliveryRate>;
};
