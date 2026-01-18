/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Nested serializer for displaying OrderItems.
 */
export type OrderItem = {
    readonly id?: number;
    /**
     * The specific InventoryUnit sold (required for unique items like phones).
     */
    inventory_unit?: number | null;
    readonly unit_id?: number | null;
    readonly product_template_name?: string;
    readonly serial_number?: string | null;
    readonly imei?: string | null;
    /**
     * Quantity of this item bought in the order.
     */
    quantity?: number;
    /**
     * Selling price of the unit at the moment of order.
     */
    readonly unit_price_at_purchase?: string;
    readonly sub_total?: string;
};

