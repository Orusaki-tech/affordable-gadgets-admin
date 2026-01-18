/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for Brand model.
 */
export type PatchedBrandRequest = {
    code?: string;
    name?: string;
    description?: string;
    is_active?: boolean;
    logo?: Blob | null;
    /**
     * Hex color code
     */
    primary_color?: string;
    /**
     * Domain for this brand's e-commerce site
     */
    ecommerce_domain?: string;
};

