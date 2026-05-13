import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DeliveryRatesService {
    /**
     * Manage delivery rates (order manager only).
     * @param page A page number within the paginated result set.
     * @returns PaginatedDeliveryRateList
     * @throws ApiError
     */
    static deliveryRatesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/delivery-rates/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Manage delivery rates (order manager only).
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/delivery-rates/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesUpdate(id, requestBody) {
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
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @param requestBody
     * @returns DeliveryRate
     * @throws ApiError
     */
    static deliveryRatesPartialUpdate(id, requestBody) {
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
     * Manage delivery rates (order manager only).
     * @param id A unique integer value identifying this delivery rate.
     * @returns void
     * @throws ApiError
     */
    static deliveryRatesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/delivery-rates/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
