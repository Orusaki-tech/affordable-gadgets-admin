import type { Lead } from './Lead';
export type PaginatedLeadList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Lead>;
};
