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
    readonly total_value?: number;
    expires_at: string;
    is_submitted?: boolean;
};
