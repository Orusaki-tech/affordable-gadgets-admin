import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BundleItemsService {
    /**
     * Bundle item management (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleItemList
     * @throws ApiError
     */
    static bundleItemsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bundle-items/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Bundle item management (admin and marketing managers).
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bundle-items/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bundle-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/bundle-items/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @param requestBody
     * @returns BundleItem
     * @throws ApiError
     */
    static bundleItemsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/bundle-items/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle item management (admin and marketing managers).
     * @param id A unique integer value identifying this bundle item.
     * @returns void
     * @throws ApiError
     */
    static bundleItemsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/bundle-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
