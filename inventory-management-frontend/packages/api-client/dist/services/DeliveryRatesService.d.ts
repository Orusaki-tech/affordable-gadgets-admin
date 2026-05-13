import type { DeliveryRate } from '../models/DeliveryRate';
import type { DeliveryRateRequest } from '../models/DeliveryRateRequest';
import type { PaginatedDeliveryRateList } from '../models/PaginatedDeliveryRateList';
import type { PatchedDeliveryRateRequest } from '../models/PatchedDeliveryRateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class DeliveryRatesService {
    /**
     * Manage delivery rates (order manager only).
     * @param page A page number within the paginated result set.
     * @returns PaginatedDeliveryRateList
     * @throws ApiError
     */
    static deliveryRatesList(page?: number): CancelablePromise<PaginatedDeliveryRateList>;
    /**
     * Manage delivery rates (order manager only).
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesCreate(requestBody: DeliveryRateRequest): CancelablePromise<DeliveryRate>;
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesRetrieve(id: number): CancelablePromise<DeliveryRate>;
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesUpdate(id: number, requestBody: DeliveryRateRequest): CancelablePromise<DeliveryRate>;
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesPartialUpdate(id: number, requestBody?: PatchedDeliveryRateRequest): CancelablePromise<DeliveryRate>;
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @returns void
     * @throws ApiError
     */
    static deliveryRatesDestroy(id: number): CancelablePromise<void>;
}
