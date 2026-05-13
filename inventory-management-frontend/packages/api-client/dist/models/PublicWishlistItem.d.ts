import type { PublicProductList } from './PublicProductList';
/**
 * Public wishlist item serializer.
 */
export type PublicWishlistItem = {
    readonly id?: number;
    readonly product?: PublicProductList;
    readonly created_at?: string;
};
