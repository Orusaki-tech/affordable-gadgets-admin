import type { PublicInventoryUnitPublic } from './PublicInventoryUnitPublic';
/**
 * Cart item serializer.
 */
export type CartItem = {
    readonly id?: number;
    readonly inventory_unit?: PublicInventoryUnitPublic;
    quantity?: number;
    readonly unit_price?: string;
    readonly promotion_id?: number | null;
    readonly bundle_id?: number | null;
    readonly bundle_group_id?: string | null;
};
