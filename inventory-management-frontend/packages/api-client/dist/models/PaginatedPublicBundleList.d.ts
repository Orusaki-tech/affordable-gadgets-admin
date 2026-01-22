import type { PublicBundle } from './PublicBundle';
export type PaginatedPublicBundleList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicBundle>;
};
