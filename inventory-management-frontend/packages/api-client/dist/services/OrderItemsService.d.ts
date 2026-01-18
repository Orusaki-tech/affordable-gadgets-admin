import type { OrderItem } from '../models/OrderItem';
import type { OrderItemRequest } from '../models/OrderItemRequest';
import type { PaginatedOrderItemList } from '../models/PaginatedOrderItemList';
import type { PatchedOrderItemRequest } from '../models/PatchedOrderItemRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class OrderItemsService {
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param page A page number within the paginated result set.
     * @returns PaginatedOrderItemList
     * @throws ApiError
     */
    static orderItemsList(page?: number): CancelablePromise<PaginatedOrderItemList>;
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsCreate(requestBody: OrderItemRequest): CancelablePromise<OrderItem>;
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsRetrieve(id: number): CancelablePromise<OrderItem>;
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsUpdate(id: number, requestBody: OrderItemRequest): CancelablePromise<OrderItem>;
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @param requestBody
     * @returns OrderItem
     * @throws ApiError
     */
    static orderItemsPartialUpdate(id: number, requestBody?: PatchedOrderItemRequest): CancelablePromise<OrderItem>;
    /**
     * CRUD for Order Items. Strictly Admin-only access.
     * Generally used only for reporting and admin-level viewing of existing orders.
     * Uses IsAdminUser.
     * @param id A unique integer value identifying this order item.
     * @returns void
     * @throws ApiError
     */
    static orderItemsDestroy(id: number): CancelablePromise<void>;
}
