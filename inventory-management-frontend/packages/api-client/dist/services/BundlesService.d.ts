import type { Bundle } from '../models/Bundle';
import type { BundleRequest } from '../models/BundleRequest';
import type { PaginatedBundleList } from '../models/PaginatedBundleList';
import type { PatchedBundleRequest } from '../models/PatchedBundleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class BundlesService {
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleList
     * @throws ApiError
     */
    static bundlesList(page?: number): CancelablePromise<PaginatedBundleList>;
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesCreate(requestBody: BundleRequest): CancelablePromise<Bundle>;
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesRetrieve(id: number): CancelablePromise<Bundle>;
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesUpdate(id: number, requestBody: BundleRequest): CancelablePromise<Bundle>;
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesPartialUpdate(id: number, requestBody?: PatchedBundleRequest): CancelablePromise<Bundle>;
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @returns void
     * @throws ApiError
     */
    static bundlesDestroy(id: number): CancelablePromise<void>;
}
