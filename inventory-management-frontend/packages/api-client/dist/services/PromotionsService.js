import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromotionsService {
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionList
     * @throws ApiError
     */
    static promotionsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/promotions/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/promotions/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/promotions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/promotions/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/promotions/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @returns void
     * @throws ApiError
     */
    static promotionsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/promotions/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
