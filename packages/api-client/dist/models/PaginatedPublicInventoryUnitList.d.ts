import type { PublicInventoryUnit } from './PublicInventoryUnit';
export type PaginatedPublicInventoryUnitList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicInventoryUnit>;
};
