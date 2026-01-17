import type { InventoryUnit } from './InventoryUnit';
export type PaginatedInventoryUnitList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<InventoryUnit>;
};
