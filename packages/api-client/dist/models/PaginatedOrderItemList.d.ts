import type { OrderItem } from './OrderItem';
export type PaginatedOrderItemList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<OrderItem>;
};
