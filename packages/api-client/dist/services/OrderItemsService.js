import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderItemsService {
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param page A page number within the paginated result set.
     * @returns PaginatedOrderItemList
     * @throws ApiError
     */
    static orderItemsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order-items/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order-items/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/order-items/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/order-items/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @returns void
     * @throws ApiError
     */
    static orderItemsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/order-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
