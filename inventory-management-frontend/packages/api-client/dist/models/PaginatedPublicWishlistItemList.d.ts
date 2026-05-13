import type { PublicWishlistItem } from './PublicWishlistItem';
export type PaginatedPublicWishlistItemList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<PublicWishlistItem>;
};
