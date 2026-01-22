import type { Bundle } from './Bundle';
export type PaginatedBundleList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Bundle>;
};
