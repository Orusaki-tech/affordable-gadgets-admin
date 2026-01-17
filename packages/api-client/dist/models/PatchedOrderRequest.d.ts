import type { OrderItemRequest } from './OrderItemRequest';
import type { OrderStatusEnum } from './OrderStatusEnum';
/**
 * Serializer for the Order model. Handles nested creation of OrderItems,
 * inventory management, and total calculation.
 */
export type PatchedOrderRequest = {
    status?: OrderStatusEnum;
    order_source?: string;
    order_items?: Array<OrderItemRequest>;
};
