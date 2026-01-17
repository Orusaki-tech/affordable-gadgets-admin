import type { InitiatePaymentRequestRequest } from '../models/InitiatePaymentRequestRequest';
import type { Order } from '../models/Order';
import type { OrderRequest } from '../models/OrderRequest';
import type { PaginatedOrderList } from '../models/PaginatedOrderList';
import type { PatchedOrderRequest } from '../models/PatchedOrderRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class OrdersService {
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param page A page number within the paginated result set.
     * @returns PaginatedOrderList
     * @throws ApiError
     */
    static ordersList(page?: number): CancelablePromise<PaginatedOrderList>;
    /**
     * Override create to handle idempotency via Idempotency-Key header.
     * If an order with the same idempotency key exists, return it instead of creating a new one.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersCreate(requestBody: OrderRequest): CancelablePromise<Order>;
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
    static ordersRetrieve(orderId: string): CancelablePromise<Order>;
    /**
     * Override update to allow partial updates (status-only updates).
     * This allows updating just the status without requiring all fields.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersUpdate(orderId: string, requestBody: OrderRequest): CancelablePromise<Order>;
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
    static ordersPartialUpdate(orderId: string, requestBody?: PatchedOrderRequest): CancelablePromise<Order>;
    /**
     * Handles Order creation and management.
     * - Admins can view/manage all orders.
     * - Customers can only view/manage their own orders.
     * - Guest users can create orders (no login required).
     * @param orderId A UUID string identifying this order.
     * @returns void
     * @throws ApiError
     */
    static ordersDestroy(orderId: string): CancelablePromise<void>;
    /**
     * Confirm payment for an order - transitions units from PENDING_PAYMENT to SOLD and status to PAID.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    static ordersConfirmPaymentCreate(orderId: string, requestBody: OrderRequest): CancelablePromise<Order>;
    /**
     * Initiate Pesapal payment for an order.
     * @param orderId A UUID string identifying this order.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static ordersInitiatePaymentCreate(orderId: string, requestBody: InitiatePaymentRequestRequest): CancelablePromise<Record<string, any>>;
    /**
     * Get payment status for an order.
     * @param orderId A UUID string identifying this order.
     * @returns Order
     * @throws ApiError
     */
    static ordersPaymentStatusRetrieve(orderId: string): CancelablePromise<Order>;
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
    static ordersReceiptRetrieve(orderId: string): CancelablePromise<Blob>;
}
