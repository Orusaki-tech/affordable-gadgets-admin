import type { Cart } from './Cart';
export type PaginatedCartList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Cart>;
};
