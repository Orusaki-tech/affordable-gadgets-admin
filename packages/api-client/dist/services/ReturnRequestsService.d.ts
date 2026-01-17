import type { PaginatedReturnRequestList } from '../models/PaginatedReturnRequestList';
import type { PatchedReturnRequestRequest } from '../models/PatchedReturnRequestRequest';
import type { ReturnRequest } from '../models/ReturnRequest';
import type { ReturnRequestRequest } from '../models/ReturnRequestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReturnRequestsService {
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param page A page number within the paginated result set.
     * @returns PaginatedReturnRequestList
     * @throws ApiError
     */
    static returnRequestsList(page?: number): CancelablePromise<PaginatedReturnRequestList>;
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    static returnRequestsCreate(requestBody?: ReturnRequestRequest): CancelablePromise<ReturnRequest>;
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @returns ReturnRequest
     * @throws ApiError
     */
    static returnRequestsRetrieve(id: number): CancelablePromise<ReturnRequest>;
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    static returnRequestsUpdate(id: number, requestBody?: ReturnRequestRequest): CancelablePromise<ReturnRequest>;
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    static returnRequestsPartialUpdate(id: number, requestBody?: PatchedReturnRequestRequest): CancelablePromise<ReturnRequest>;
    /**
     * ViewSet for managing return requests (bulk returns of reserved units).
     * - Salespersons can create return requests for their reserved units
     * - Inventory Managers can approve/reject return requests
     * @param id A unique integer value identifying this Return Request.
     * @returns void
     * @throws ApiError
     */
    static returnRequestsDestroy(id: number): CancelablePromise<void>;
    /**
     * Bulk approve multiple return requests.
     * @param requestBody
     * @returns ReturnRequest
     * @throws ApiError
     */
    static returnRequestsBulkApproveCreate(requestBody?: ReturnRequestRequest): CancelablePromise<ReturnRequest>;
}
