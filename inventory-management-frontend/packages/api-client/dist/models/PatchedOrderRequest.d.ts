import type { OrderItemRequest } from './OrderItemRequest';
import type { OrderStatusEnum } from './OrderStatusEnum';
/**
 * Serializer for the Order model. Handles nested creation of OrderItems,
 * inventory management, and total calculation.
 */
export type PatchedOrderRequest = {
    delivery_county?: string;
    delivery_ward?: string | null;
    is_items_paid?: boolean;
    is_delivery_paid?: boolean;
    delivery_window_start?: string | null;
    delivery_window_end?: string | null;
    delivery_notes?: string;
    status?: OrderStatusEnum;
    order_source?: string;
    order_items?: Array<OrderItemRequest>;
};
