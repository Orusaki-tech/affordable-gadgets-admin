import type { AuditLog } from '../models/AuditLog';
import type { PaginatedAuditLogList } from '../models/PaginatedAuditLogList';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AuditLogsService {
    /**
     * ViewSet for audit logs (Inventory Manager and Superuser only).
     * Read-only access to view system audit trail.
     * @param page A page number within the paginated result set.
     * @returns PaginatedAuditLogList
     * @throws ApiError
     */
    static auditLogsList(page?: number): CancelablePromise<PaginatedAuditLogList>;
    /**
     * ViewSet for audit logs (Inventory Manager and Superuser only).
     * Read-only access to view system audit trail.
     * @param id A unique integer value identifying this audit log.
     * @returns AuditLog
     * @throws ApiError
     */
    static auditLogsRetrieve(id: number): CancelablePromise<AuditLog>;
}
