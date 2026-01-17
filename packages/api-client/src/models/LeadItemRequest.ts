/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for LeadItem (admin).
 */
export type LeadItemRequest = {
    inventory_unit: number;
    quantity?: number;
    /**
     * Price at time of lead creation
     */
    unit_price: string;
};

