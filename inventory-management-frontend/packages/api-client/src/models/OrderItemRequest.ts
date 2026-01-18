/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Nested serializer for displaying OrderItems.
 */
export type OrderItemRequest = {
    /**
     * The specific InventoryUnit sold (required for unique items like phones).
     */
    inventory_unit?: number | null;
    inventory_unit_id: number;
    /**
     * Quantity of this item bought in the order.
     */
    quantity?: number;
};

