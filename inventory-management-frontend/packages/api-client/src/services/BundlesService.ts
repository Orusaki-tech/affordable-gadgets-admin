/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Bundle } from '../models/Bundle';
import type { BundleRequest } from '../models/BundleRequest';
import type { PaginatedBundleList } from '../models/PaginatedBundleList';
import type { PatchedBundleRequest } from '../models/PatchedBundleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BundlesService {
    /**
     * Bundle management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedBundleList
     * @throws ApiError
     */
    public static bundlesList(
        page?: number,
    ): CancelablePromise<PaginatedBundleList> {
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
    public static bundlesCreate(
        requestBody: BundleRequest,
    ): CancelablePromise<Bundle> {
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
    public static bundlesRetrieve(
        id: number,
    ): CancelablePromise<Bundle> {
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
    public static bundlesUpdate(
        id: number,
        requestBody: BundleRequest,
    ): CancelablePromise<Bundle> {
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
    public static bundlesPartialUpdate(
        id: number,
        requestBody?: PatchedBundleRequest,
    ): CancelablePromise<Bundle> {
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
    public static bundlesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/bundles/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
