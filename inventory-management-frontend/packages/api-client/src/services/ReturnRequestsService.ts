/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedReturnRequestList } from '../models/PaginatedReturnRequestList';
import type { PatchedReturnRequestRequest } from '../models/PatchedReturnRequestRequest';
import type { ReturnRequest } from '../models/ReturnRequest';
import type { ReturnRequestRequest } from '../models/ReturnRequestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReturnRequestsService {
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param page A page number within the paginated result set.
     * @returns PaginatedReturnRequestList
     * @throws ApiError
     */
    public static returnRequestsList(
        page?: number,
    ): CancelablePromise<PaginatedReturnRequestList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/return-requests/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    public static returnRequestsCreate(
        requestBody?: ReturnRequestRequest,
    ): CancelablePromise<ReturnRequest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/return-requests/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @returns ReturnRequest
     * @throws ApiError
     */
    public static returnRequestsRetrieve(
        id: number,
    ): CancelablePromise<ReturnRequest> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/return-requests/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    public static returnRequestsUpdate(
        id: number,
        requestBody?: ReturnRequestRequest,
    ): CancelablePromise<ReturnRequest> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/return-requests/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    public static returnRequestsPartialUpdate(
        id: number,
        requestBody?: PatchedReturnRequestRequest,
    ): CancelablePromise<ReturnRequest> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/return-requests/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @returns void
     * @throws ApiError
     */
    public static returnRequestsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/return-requests/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Bulk approve multiple return requests.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    public static returnRequestsBulkApproveCreate(
        requestBody?: ReturnRequestRequest,
    ): CancelablePromise<ReturnRequest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/return-requests/bulk_approve/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
