/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedProductAccessoryList } from '../models/PaginatedProductAccessoryList';
import type { PatchedProductAccessoryRequest } from '../models/PatchedProductAccessoryRequest';
import type { ProductAccessory } from '../models/ProductAccessory';
import type { ProductAccessoryRequest } from '../models/ProductAccessoryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccessoriesLinkService {
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param accessory
     * @param mainProduct
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductAccessoryList
     * @throws ApiError
     */
    public static accessoriesLinkList(
        accessory?: number,
        mainProduct?: number,
        page?: number,
    ): CancelablePromise<PaginatedProductAccessoryList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accessories-link/',
            query: {
                'accessory': accessory,
                'main_product': mainProduct,
                'page': page,
            },
        });
    }
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    public static accessoriesLinkCreate(
        requestBody: ProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accessories-link/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns ProductAccessory
     * @throws ApiError
     */
    public static accessoriesLinkRetrieve(
        id: number,
    ): CancelablePromise<ProductAccessory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accessories-link/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    public static accessoriesLinkUpdate(
        id: number,
        requestBody: ProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/accessories-link/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    public static accessoriesLinkPartialUpdate(
        id: number,
        requestBody?: PatchedProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/accessories-link/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns void
     * @throws ApiError
     */
    public static accessoriesLinkDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/accessories-link/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
