/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BundleItem } from '../models/BundleItem';
import type { BundleItemRequest } from '../models/BundleItemRequest';
import type { PaginatedBundleItemList } from '../models/PaginatedBundleItemList';
import type { PatchedBundleItemRequest } from '../models/PatchedBundleItemRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BundleItemsService {
    /**
     * Bundle item management (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleItemList
     * @throws ApiError
     */
    public static bundleItemsList(
        page?: number,
    ): CancelablePromise<PaginatedBundleItemList> {
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
    public static bundleItemsCreate(
        requestBody: BundleItemRequest,
    ): CancelablePromise<BundleItem> {
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
    public static bundleItemsRetrieve(
        id: number,
    ): CancelablePromise<BundleItem> {
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
    public static bundleItemsUpdate(
        id: number,
        requestBody: BundleItemRequest,
    ): CancelablePromise<BundleItem> {
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
    public static bundleItemsPartialUpdate(
        id: number,
        requestBody?: PatchedBundleItemRequest,
    ): CancelablePromise<BundleItem> {
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
    public static bundleItemsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/bundle-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
