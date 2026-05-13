import type { FinancingOffer } from '../models/FinancingOffer';
import type { FinancingOfferRequest } from '../models/FinancingOfferRequest';
import type { PaginatedFinancingOfferList } from '../models/PaginatedFinancingOfferList';
import type { PatchedFinancingOfferRequest } from '../models/PatchedFinancingOfferRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class FinancingOffersService {
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param isActive
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param provider
     * @param ramGb
     * @param romGb
     * @param search A search term.
     * @returns PaginatedFinancingOfferList
     * @throws ApiError
     */
    static financingOffersList(isActive?: boolean, ordering?: string, page?: number, product?: number, provider?: number, ramGb?: number, romGb?: number, search?: string): CancelablePromise<PaginatedFinancingOfferList>;
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    static financingOffersCreate(requestBody: FinancingOfferRequest): CancelablePromise<FinancingOffer>;
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @returns FinancingOffer
     * @throws ApiError
     */
    static financingOffersRetrieve(id: number): CancelablePromise<FinancingOffer>;
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    static financingOffersUpdate(id: number, requestBody: FinancingOfferRequest): CancelablePromise<FinancingOffer>;
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    static financingOffersPartialUpdate(id: number, requestBody?: PatchedFinancingOfferRequest): CancelablePromise<FinancingOffer>;
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @returns void
     * @throws ApiError
     */
    static financingOffersDestroy(id: number): CancelablePromise<void>;
}
