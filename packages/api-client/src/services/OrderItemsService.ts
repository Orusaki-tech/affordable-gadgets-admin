/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from '../models/OrderItem';
import type { OrderItemRequest } from '../models/OrderItemRequest';
import type { PaginatedOrderItemList } from '../models/PaginatedOrderItemList';
import type { PatchedOrderItemRequest } from '../models/PatchedOrderItemRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static orderItemsList(
        page?: number,
    ): CancelablePromise<PaginatedOrderItemList> {
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
    public static orderItemsCreate(
        requestBody: OrderItemRequest,
    ): CancelablePromise<OrderItem> {
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
    public static orderItemsRetrieve(
        id: number,
    ): CancelablePromise<OrderItem> {
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
    public static orderItemsUpdate(
        id: number,
        requestBody: OrderItemRequest,
    ): CancelablePromise<OrderItem> {
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
    public static orderItemsPartialUpdate(
        id: number,
        requestBody?: PatchedOrderItemRequest,
    ): CancelablePromise<OrderItem> {
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
    public static orderItemsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/order-items/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
