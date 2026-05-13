import type { FinancingProvider } from '../models/FinancingProvider';
import type { FinancingProviderRequest } from '../models/FinancingProviderRequest';
import type { PaginatedFinancingProviderList } from '../models/PaginatedFinancingProviderList';
import type { PatchedFinancingProviderRequest } from '../models/PatchedFinancingProviderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class FinancingProvidersService {
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFinancingProviderList
     * @throws ApiError
     */
    static financingProvidersList(ordering?: string, page?: number, search?: string): CancelablePromise<PaginatedFinancingProviderList>;
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersCreate(formData: FinancingProviderRequest): CancelablePromise<FinancingProvider>;
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersRetrieve(id: number): CancelablePromise<FinancingProvider>;
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersUpdate(id: number, formData: FinancingProviderRequest): CancelablePromise<FinancingProvider>;
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersPartialUpdate(id: number, formData?: PatchedFinancingProviderRequest): CancelablePromise<FinancingProvider>;
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns void
     * @throws ApiError
     */
    static financingProvidersDestroy(id: number): CancelablePromise<void>;
}
