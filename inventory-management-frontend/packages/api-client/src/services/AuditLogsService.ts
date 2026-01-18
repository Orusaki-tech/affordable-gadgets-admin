/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuditLog } from '../models/AuditLog';
import type { PaginatedAuditLogList } from '../models/PaginatedAuditLogList';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static auditLogsList(
        page?: number,
    ): CancelablePromise<PaginatedAuditLogList> {
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
    public static auditLogsRetrieve(
        id: number,
    ): CancelablePromise<AuditLog> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/audit-logs/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
