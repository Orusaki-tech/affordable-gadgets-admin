/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedPromotionTypeList } from '../models/PaginatedPromotionTypeList';
import type { PatchedPromotionTypeRequest } from '../models/PatchedPromotionTypeRequest';
import type { PromotionType } from '../models/PromotionType';
import type { PromotionTypeRequest } from '../models/PromotionTypeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromotionTypesService {
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionTypeList
     * @throws ApiError
     */
    public static promotionTypesList(
        page?: number,
    ): CancelablePromise<PaginatedPromotionTypeList> {
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
    public static promotionTypesCreate(
        requestBody: PromotionTypeRequest,
    ): CancelablePromise<PromotionType> {
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
    public static promotionTypesRetrieve(
        id: number,
    ): CancelablePromise<PromotionType> {
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
    public static promotionTypesUpdate(
        id: number,
        requestBody: PromotionTypeRequest,
    ): CancelablePromise<PromotionType> {
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
    public static promotionTypesPartialUpdate(
        id: number,
        requestBody?: PatchedPromotionTypeRequest,
    ): CancelablePromise<PromotionType> {
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
    public static promotionTypesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/promotion-types/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
