/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedReservationRequestList } from '../models/PaginatedReservationRequestList';
import type { PatchedReservationRequestRequest } from '../models/PatchedReservationRequestRequest';
import type { ReservationRequest } from '../models/ReservationRequest';
import type { ReservationRequestRequest } from '../models/ReservationRequestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReservationRequestsService {
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param page A page number within the paginated result set.
     * @returns PaginatedReservationRequestList
     * @throws ApiError
     */
    public static reservationRequestsList(
        page?: number,
    ): CancelablePromise<PaginatedReservationRequestList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reservation-requests/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    public static reservationRequestsCreate(
        requestBody?: ReservationRequestRequest,
    ): CancelablePromise<ReservationRequest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation-requests/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @returns ReservationRequest
     * @throws ApiError
     */
    public static reservationRequestsRetrieve(
        id: number,
    ): CancelablePromise<ReservationRequest> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reservation-requests/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Override update to ensure we return the refreshed object after approval/rejection.
     * @param id A unique integer value identifying this Reservation Request.
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    public static reservationRequestsUpdate(
        id: number,
        requestBody?: ReservationRequestRequest,
    ): CancelablePromise<ReservationRequest> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/reservation-requests/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @param requestBody
     * @returns ReservationRequest
     * @throws ApiError
     */
    public static reservationRequestsPartialUpdate(
        id: number,
        requestBody?: PatchedReservationRequestRequest,
    ): CancelablePromise<ReservationRequest> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/reservation-requests/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing reservation requests.
     * - Salespersons can create requests and view their own
     * - Inventory Managers can approve/reject and view all pending requests
     * @param id A unique integer value identifying this Reservation Request.
     * @returns void
     * @throws ApiError
     */
    public static reservationRequestsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/reservation-requests/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
