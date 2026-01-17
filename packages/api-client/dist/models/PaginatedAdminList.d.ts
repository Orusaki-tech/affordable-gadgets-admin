import type { Admin } from './Admin';
export type PaginatedAdminList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Admin>;
};
