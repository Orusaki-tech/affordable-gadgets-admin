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
    static unitTransfersList(page) {
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
    static unitTransfersCreate(requestBody) {
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
    static unitTransfersRetrieve(id) {
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
    static unitTransfersUpdate(id, requestBody) {
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
    static unitTransfersPartialUpdate(id, requestBody) {
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
    static unitTransfersDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/unit-transfers/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
