import type { UnitTransfer } from './UnitTransfer';
export type PaginatedUnitTransferList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<UnitTransfer>;
};
