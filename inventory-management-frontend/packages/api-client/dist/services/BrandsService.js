import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BrandsService {
    /**
     * Brand management ViewSet.
     * @param page A page number within the paginated result set.
     * @returns PaginatedBrandList
     * @throws ApiError
     */
    static brandsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/brands/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Brand management ViewSet.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/brands/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @returns Brand
     * @throws ApiError
     */
    static brandsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/brands/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/brands/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/brands/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @returns void
     * @throws ApiError
     */
    static brandsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/brands/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
