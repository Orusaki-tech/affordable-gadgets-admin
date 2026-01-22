import type { OrderItem } from './OrderItem';
import type { OrderStatusEnum } from './OrderStatusEnum';
import type { User } from './User';
/**
 * Serializer for the Order model. Handles nested creation of OrderItems,
 * inventory management, and total calculation.
 */
export type Order = {
    readonly order_id?: string;
    readonly user?: User;
    readonly customer?: number;
    readonly customer_username?: string | null;
    readonly customer_phone?: string;
    readonly customer_email?: string;
    readonly delivery_address?: string;
    readonly created_at?: string;
    status?: OrderStatusEnum;
    readonly status_display?: string;
    order_source?: string;
    readonly order_source_display?: string;
    readonly total_amount?: string;
    order_items: Array<OrderItem>;
    readonly brand?: number | null;
    readonly brand_name?: string | null;
};
