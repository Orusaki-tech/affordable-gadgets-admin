import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuditLogsService {
    /**
     * ViewSet for audit logs (Inventory Manager and Superuser only).
     * Read-only access to view system audit trail.
     * @param page A page number within the paginated result set.
     * @returns PaginatedAuditLogList
     * @throws ApiError
     */
    static auditLogsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/audit-logs/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * ViewSet for audit logs (Inventory Manager and Superuser only).
     * Read-only access to view system audit trail.
     * @param id A unique integer value identifying this audit log.
     * @returns AuditLog
     * @throws ApiError
     */
    static auditLogsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/audit-logs/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
