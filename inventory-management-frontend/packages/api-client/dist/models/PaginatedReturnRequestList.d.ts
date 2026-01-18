import type { ReturnRequest } from './ReturnRequest';
export type PaginatedReturnRequestList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ReturnRequest>;
};
