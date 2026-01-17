import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ColorsService {
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedColorList
     * @throws ApiError
     */
    static colorsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/colors/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/colors/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns Color
     * @throws ApiError
     */
    static colorsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns void
     * @throws ApiError
     */
    static colorsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
