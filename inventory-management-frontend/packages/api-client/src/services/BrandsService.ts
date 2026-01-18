/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Brand } from '../models/Brand';
import type { BrandRequest } from '../models/BrandRequest';
import type { PaginatedBrandList } from '../models/PaginatedBrandList';
import type { PatchedBrandRequest } from '../models/PatchedBrandRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BrandsService {
    /**
     * Brand management ViewSet.
     * @param page A page number within the paginated result set.
     * @returns PaginatedBrandList
     * @throws ApiError
     */
    public static brandsList(
        page?: number,
    ): CancelablePromise<PaginatedBrandList> {
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
    public static brandsCreate(
        requestBody: BrandRequest,
    ): CancelablePromise<Brand> {
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
    public static brandsRetrieve(
        id: number,
    ): CancelablePromise<Brand> {
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
    public static brandsUpdate(
        id: number,
        requestBody: BrandRequest,
    ): CancelablePromise<Brand> {
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
    public static brandsPartialUpdate(
        id: number,
        requestBody?: PatchedBrandRequest,
    ): CancelablePromise<Brand> {
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
    public static brandsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/brands/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
