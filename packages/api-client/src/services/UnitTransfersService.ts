/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedUnitTransferList } from '../models/PaginatedUnitTransferList';
import type { PatchedUnitTransferRequest } from '../models/PatchedUnitTransferRequest';
import type { UnitTransfer } from '../models/UnitTransfer';
import type { UnitTransferRequest } from '../models/UnitTransferRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UnitTransfersService {
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param page A page number within the paginated result set.
     * @returns PaginatedUnitTransferList
     * @throws ApiError
     */
    public static unitTransfersList(
        page?: number,
    ): CancelablePromise<PaginatedUnitTransferList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/unit-transfers/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    public static unitTransfersCreate(
        requestBody: UnitTransferRequest,
    ): CancelablePromise<UnitTransfer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/unit-transfers/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @returns UnitTransfer
     * @throws ApiError
     */
    public static unitTransfersRetrieve(
        id: number,
    ): CancelablePromise<UnitTransfer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/unit-transfers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    public static unitTransfersUpdate(
        id: number,
        requestBody: UnitTransferRequest,
    ): CancelablePromise<UnitTransfer> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/unit-transfers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    public static unitTransfersPartialUpdate(
        id: number,
        requestBody?: PatchedUnitTransferRequest,
    ): CancelablePromise<UnitTransfer> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/unit-transfers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @returns void
     * @throws ApiError
     */
    public static unitTransfersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/unit-transfers/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
