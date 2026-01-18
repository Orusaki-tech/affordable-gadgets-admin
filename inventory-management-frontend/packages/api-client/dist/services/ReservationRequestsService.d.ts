import type { PaginatedReservationRequestList } from '../models/PaginatedReservationRequestList';
import type { PatchedReservationRequestRequest } from '../models/PatchedReservationRequestRequest';
import type { ReservationRequest } from '../models/ReservationRequest';
import type { ReservationRequestRequest } from '../models/ReservationRequestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReservationRequestsService {
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param page A page number within the paginated result set.
     * @returns PaginatedReservationRequestList
     * @throws ApiError
     */
    static reservationRequestsList(page?: number): CancelablePromise<PaginatedReservationRequestList>;
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    static reservationRequestsCreate(requestBody?: ReservationRequestRequest): CancelablePromise<ReservationRequest>;
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @returns ReservationRequest
     * @throws ApiError
     */
    static reservationRequestsRetrieve(id: number): CancelablePromise<ReservationRequest>;
    /**
     * Override update to ensure we return the refreshed object after approval/rejection.
     * @param id A unique integer value identifying this Reservation Request.
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    static reservationRequestsUpdate(id: number, requestBody?: ReservationRequestRequest): CancelablePromise<ReservationRequest>;
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    static reservationRequestsPartialUpdate(id: number, requestBody?: PatchedReservationRequestRequest): CancelablePromise<ReservationRequest>;
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @returns void
     * @throws ApiError
     */
    static reservationRequestsDestroy(id: number): CancelablePromise<void>;
}
