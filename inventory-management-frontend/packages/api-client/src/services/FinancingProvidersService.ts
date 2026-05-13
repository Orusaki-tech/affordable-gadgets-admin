/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancingProvider } from '../models/FinancingProvider';
import type { FinancingProviderRequest } from '../models/FinancingProviderRequest';
import type { PaginatedFinancingProviderList } from '../models/PaginatedFinancingProviderList';
import type { PatchedFinancingProviderRequest } from '../models/PatchedFinancingProviderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FinancingProvidersService {
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFinancingProviderList
     * @throws ApiError
     */
    public static financingProvidersList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedFinancingProviderList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-providers/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    public static financingProvidersCreate(
        formData: FinancingProviderRequest,
    ): CancelablePromise<FinancingProvider> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/financing-providers/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns FinancingProvider
     * @throws ApiError
     */
    public static financingProvidersRetrieve(
        id: number,
    ): CancelablePromise<FinancingProvider> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    public static financingProvidersUpdate(
        id: number,
        formData: FinancingProviderRequest,
    ): CancelablePromise<FinancingProvider> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    public static financingProvidersPartialUpdate(
        id: number,
        formData?: PatchedFinancingProviderRequest,
    ): CancelablePromise<FinancingProvider> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns void
     * @throws ApiError
     */
    public static financingProvidersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
