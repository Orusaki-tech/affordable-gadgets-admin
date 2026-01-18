import type { AuditLog } from './AuditLog';
export type PaginatedAuditLogList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<AuditLog>;
};
