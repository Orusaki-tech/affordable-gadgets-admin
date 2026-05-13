/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancingOffer } from '../models/FinancingOffer';
import type { FinancingOfferRequest } from '../models/FinancingOfferRequest';
import type { PaginatedFinancingOfferList } from '../models/PaginatedFinancingOfferList';
import type { PatchedFinancingOfferRequest } from '../models/PatchedFinancingOfferRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FinancingOffersService {
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param isActive
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param provider
     * @param ramGb
     * @param romGb
     * @param search A search term.
     * @returns PaginatedFinancingOfferList
     * @throws ApiError
     */
    public static financingOffersList(
        isActive?: boolean,
        ordering?: string,
        page?: number,
        product?: number,
        provider?: number,
        ramGb?: number,
        romGb?: number,
        search?: string,
    ): CancelablePromise<PaginatedFinancingOfferList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-offers/',
            query: {
                'is_active': isActive,
                'ordering': ordering,
                'page': page,
                'product': product,
                'provider': provider,
                'ram_gb': ramGb,
                'rom_gb': romGb,
                'search': search,
            },
        });
    }
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    public static financingOffersCreate(
        requestBody: FinancingOfferRequest,
    ): CancelablePromise<FinancingOffer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/financing-offers/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @returns FinancingOffer
     * @throws ApiError
     */
    public static financingOffersRetrieve(
        id: number,
    ): CancelablePromise<FinancingOffer> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-offers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    public static financingOffersUpdate(
        id: number,
        requestBody: FinancingOfferRequest,
    ): CancelablePromise<FinancingOffer> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/financing-offers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @param requestBody
     * @returns FinancingOffer
     * @throws ApiError
     */
    public static financingOffersPartialUpdate(
        id: number,
        requestBody?: PatchedFinancingOfferRequest,
    ): CancelablePromise<FinancingOffer> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/financing-offers/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Financing offer management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing offer.
     * @returns void
     * @throws ApiError
     */
    public static financingOffersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/financing-offers/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
