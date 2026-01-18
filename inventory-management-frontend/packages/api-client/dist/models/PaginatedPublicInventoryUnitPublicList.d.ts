import type { PublicInventoryUnitPublic } from './PublicInventoryUnitPublic';
export type PaginatedPublicInventoryUnitPublicList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicInventoryUnitPublic>;
};
