/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for LeadItem (admin).
 */
export type LeadItem = {
    readonly id?: number;
    inventory_unit: number;
    readonly unit_id?: number;
    readonly product_name?: string;
    quantity?: number;
    /**
     * Price at time of lead creation
     */
    unit_price: string;
};

