import type { InventoryUnitImage } from './InventoryUnitImage';
export type PaginatedInventoryUnitImageList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<InventoryUnitImage>;
};
