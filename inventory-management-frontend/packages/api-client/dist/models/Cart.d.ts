import type { CartItem } from './CartItem';
/**
 * Cart serializer.
 */
export type Cart = {
    readonly id?: number;
    readonly items?: Array<CartItem>;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string | null;
    delivery_address?: string | null;
    readonly delivery_county?: string;
    readonly delivery_ward?: string;
    readonly delivery_fee?: string;
    readonly delivery_window_start?: string;
    readonly delivery_window_end?: string;
    readonly delivery_notes?: string;
    readonly total_value?: number;
    readonly total_with_delivery?: number;
    expires_at: string;
    is_submitted?: boolean;
};
