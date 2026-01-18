import type { PaginatedUnitTransferList } from '../models/PaginatedUnitTransferList';
import type { PatchedUnitTransferRequest } from '../models/PatchedUnitTransferRequest';
import type { UnitTransfer } from '../models/UnitTransfer';
import type { UnitTransferRequest } from '../models/UnitTransferRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class UnitTransfersService {
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param page A page number within the paginated result set.
     * @returns PaginatedUnitTransferList
     * @throws ApiError
     */
    static unitTransfersList(page?: number): CancelablePromise<PaginatedUnitTransferList>;
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    static unitTransfersCreate(requestBody: UnitTransferRequest): CancelablePromise<UnitTransfer>;
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @returns UnitTransfer
     * @throws ApiError
     */
    static unitTransfersRetrieve(id: number): CancelablePromise<UnitTransfer>;
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    static unitTransfersUpdate(id: number, requestBody: UnitTransferRequest): CancelablePromise<UnitTransfer>;
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @param requestBody
     * @returns UnitTransfer
     * @throws ApiError
     */
    static unitTransfersPartialUpdate(id: number, requestBody?: PatchedUnitTransferRequest): CancelablePromise<UnitTransfer>;
    /**
     * ViewSet for managing unit transfers between salespersons.
     * - Salespersons can request transfers
     * - Inventory Managers can approve/reject transfers
     * @param id A unique integer value identifying this Unit Transfer.
     * @returns void
     * @throws ApiError
     */
    static unitTransfersDestroy(id: number): CancelablePromise<void>;
}
