/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedPromotionList } from '../models/PaginatedPromotionList';
import type { PatchedPromotionRequest } from '../models/PatchedPromotionRequest';
import type { Promotion } from '../models/Promotion';
import type { PromotionRequest } from '../models/PromotionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromotionsService {
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionList
     * @throws ApiError
     */
    public static promotionsList(
        page?: number,
    ): CancelablePromise<PaginatedPromotionList> {
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
    public static promotionsCreate(
        formData: PromotionRequest,
    ): CancelablePromise<Promotion> {
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
    public static promotionsRetrieve(
        id: number,
    ): CancelablePromise<Promotion> {
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
    public static promotionsUpdate(
        id: number,
        formData: PromotionRequest,
    ): CancelablePromise<Promotion> {
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
    public static promotionsPartialUpdate(
        id: number,
        formData?: PatchedPromotionRequest,
    ): CancelablePromise<Promotion> {
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
    public static promotionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/promotions/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
