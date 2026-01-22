import type { BundleItem } from '../models/BundleItem';
import type { BundleItemRequest } from '../models/BundleItemRequest';
import type { PaginatedBundleItemList } from '../models/PaginatedBundleItemList';
import type { PatchedBundleItemRequest } from '../models/PatchedBundleItemRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class BundleItemsService {
    /**
     * Bundle item management (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleItemList
     * @throws ApiError
     */
    static bundleItemsList(page?: number): CancelablePromise<PaginatedBundleItemList>;
    /**
     * Bundle item management (admin and marketing managers).
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsCreate(requestBody: BundleItemRequest): CancelablePromise<BundleItem>;
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsRetrieve(id: number): CancelablePromise<BundleItem>;
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsUpdate(id: number, requestBody: BundleItemRequest): CancelablePromise<BundleItem>;
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsPartialUpdate(id: number, requestBody?: PatchedBundleItemRequest): CancelablePromise<BundleItem>;
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @returns void
     * @throws ApiError
     */
    static bundleItemsDestroy(id: number): CancelablePromise<void>;
}
