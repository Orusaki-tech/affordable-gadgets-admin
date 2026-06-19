/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeliveryRate } from '../models/DeliveryRate';
import type { DeliveryRateRequest } from '../models/DeliveryRateRequest';
import type { PaginatedDeliveryRateList } from '../models/PaginatedDeliveryRateList';
import type { PatchedDeliveryRateRequest } from '../models/PatchedDeliveryRateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DeliveryRatesService {
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param page A page number within the paginated result set.
     * @returns PaginatedDeliveryRateList
     * @throws ApiError
     */
    public static deliveryRatesList(
        page?: number,
    ): CancelablePromise<PaginatedDeliveryRateList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/delivery-rates/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    public static deliveryRatesCreate(
        requestBody: DeliveryRateRequest,
    ): CancelablePromise<DeliveryRate> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/delivery-rates/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param id A unique integer value identifying this delivery rate.
     * @returns DeliveryRate
     * @throws ApiError
     */
    public static deliveryRatesRetrieve(
        id: number,
    ): CancelablePromise<DeliveryRate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    public static deliveryRatesUpdate(
        id: number,
        requestBody: DeliveryRateRequest,
    ): CancelablePromise<DeliveryRate> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    public static deliveryRatesPartialUpdate(
        id: number,
        requestBody?: PatchedDeliveryRateRequest,
    ): CancelablePromise<DeliveryRate> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Manage delivery rates (order manager write; IM, SP, OM read).
     * @param id A unique integer value identifying this delivery rate.
     * @returns void
     * @throws ApiError
     */
    public static deliveryRatesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
