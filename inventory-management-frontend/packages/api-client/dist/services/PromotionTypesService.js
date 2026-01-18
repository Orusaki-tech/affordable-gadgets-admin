import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromotionTypesService {
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionTypeList
     * @throws ApiError
     */
    static promotionTypesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/promotion-types/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/promotion-types/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/promotion-types/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/promotion-types/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/promotion-types/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @returns void
     * @throws ApiError
     */
    static promotionTypesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/promotion-types/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
