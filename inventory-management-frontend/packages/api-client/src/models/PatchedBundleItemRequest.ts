/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchedBundleItemRequest = {
    bundle?: number;
    product?: number;
    quantity?: number;
    /**
     * Optional override price for this item in the bundle
     */
    override_price?: string | null;
    display_order?: number;
};

