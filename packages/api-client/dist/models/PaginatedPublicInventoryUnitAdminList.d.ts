import type { PublicInventoryUnitAdmin } from './PublicInventoryUnitAdmin';
export type PaginatedPublicInventoryUnitAdminList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicInventoryUnitAdmin>;
};
