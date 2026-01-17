import type { UnitAcquisitionSource } from './UnitAcquisitionSource';
export type PaginatedUnitAcquisitionSourceList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<UnitAcquisitionSource>;
};
