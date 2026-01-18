/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Utility serializer to calculate the discount percentage based on price difference.
 */
export type DiscountCalculatorRequest = {
    /**
     * The original selling price of the item.
     */
    original_price: string;
    /**
     * The amount the item is being sold for.
     */
    sale_price: string;
};

