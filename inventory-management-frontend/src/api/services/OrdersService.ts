/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { OrderRequest } from '../models/OrderRequest';
import type { PaginatedOrderList } from '../models/PaginatedOrderList';
import type { PatchedOrderRequest } from '../models/PatchedOrderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param page A page number within the paginated result set.
     * @returns PaginatedOrderList
     * @throws ApiError
     */
    public static ordersList(
        page?: number,
    ): CancelablePromise<PaginatedOrderList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static ordersCreate(
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param id
     * @returns Order
     * @throws ApiError
     */
    public static ordersRetrieve(
        id: string,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Override update to allow partial updates (status-only updates).
     * This allows updating just the status without requiring all fields.
     * @param id
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static ordersUpdate(
        id: string,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orders/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param id
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static ordersPartialUpdate(
        id: string,
        requestBody?: PatchedOrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static ordersDestroy(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Confirm payment for an order - transitions units from PENDING_PAYMENT to SOLD and status to PAID.
     * @param id
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static ordersConfirmPaymentCreate(
        id: string,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{id}/confirm_payment/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Initiate Pesapal payment for an order.
     * @param id
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static ordersInitiatePaymentCreate(
        id: string,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{id}/initiate_payment/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get payment status for an order.
     * @param id
     * @returns Order
     * @throws ApiError
     */
    public static ordersPaymentStatusRetrieve(
        id: string,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{id}/payment_status/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Generate and return receipt HTML/PDF.
     * @param id
     * @returns Order
     * @throws ApiError
     */
    public static ordersReceiptRetrieve(
        id: string,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{id}/receipt/',
            path: {
                'id': id,
            },
        });
    }
}
