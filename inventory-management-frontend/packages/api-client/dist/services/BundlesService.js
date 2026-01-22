import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BundlesService {
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleList
     * @throws ApiError
     */
    static bundlesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bundles/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bundles/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bundles/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/bundles/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @param requestBody
     * @returns Bundle
     * @throws ApiError
     */
    static bundlesPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/bundles/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this bundle.
     * @returns void
     * @throws ApiError
     */
    static bundlesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/bundles/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
