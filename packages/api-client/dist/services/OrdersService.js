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
    static ordersList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Override create to handle idempotency via Idempotency-Key header.
     * If an order with the same idempotency key exists, return it instead of creating a new one.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Override retrieve to allow unauthenticated users to view paid orders.
     * This enables guest checkout users to view their order details after payment.
     *
     * CRITICAL FIX: Also check if this is actually a receipt request that was
     * incorrectly routed to retrieve. If the path contains '/receipt/', redirect to receipt method.
     * @param orderId A UUID string identifying this order.
     * @returns Order
     * @throws ApiError
     */
    static ordersRetrieve(orderId) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order_id}/',
            path: {
                'order_id': orderId,
            },
        });
    }
    /**
     * Override update to allow partial updates (status-only updates).
     * This allows updating just the status without requiring all fields.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersUpdate(orderId, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orders/{order_id}/',
            path: {
                'order_id': orderId,
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
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersPartialUpdate(orderId, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/orders/{order_id}/',
            path: {
                'order_id': orderId,
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
     * @param orderId A UUID string identifying this order.
     * @returns void
     * @throws ApiError
     */
    static ordersDestroy(orderId) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders/{order_id}/',
            path: {
                'order_id': orderId,
            },
        });
    }
    /**
     * Confirm payment for an order - transitions units from PENDING_PAYMENT to SOLD and status to PAID.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersConfirmPaymentCreate(orderId, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{order_id}/confirm_payment/',
            path: {
                'order_id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Initiate Pesapal payment for an order.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersInitiatePaymentCreate(orderId, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders/{order_id}/initiate_payment/',
            path: {
                'order_id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get payment status for an order.
     * @param orderId A UUID string identifying this order.
     * @returns Order
     * @throws ApiError
     */
    static ordersPaymentStatusRetrieve(orderId) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order_id}/payment_status/',
            path: {
                'order_id': orderId,
            },
        });
    }
    /**
     * Generate and return receipt HTML/PDF.
     *
     * Security validations:
     * 1. Order must exist
     * 2. For unauthenticated users: Order must be PAID
     * 3. For authenticated users: Must be their own order (unless staff)
     * @param orderId
     * @returns binary
     * @throws ApiError
     */
    static ordersReceiptRetrieve(orderId) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders/{order_id}/receipt/',
            path: {
                'order_id': orderId,
            },
        });
    }
}
