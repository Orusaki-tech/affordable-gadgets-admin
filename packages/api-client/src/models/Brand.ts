/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for Brand model.
 */
export type Brand = {
    readonly id?: number;
    code: string;
    name: string;
    description?: string;
    is_active?: boolean;
    logo?: string | null;
    readonly logo_url?: string | null;
    /**
     * Hex color code
     */
    primary_color?: string;
    /**
     * Domain for this brand's e-commerce site
     */
    ecommerce_domain?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};

