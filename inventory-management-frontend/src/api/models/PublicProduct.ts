/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductTypeEnum } from './ProductTypeEnum';
/**
 * Public product serializer (stripped down).
 */
export type PublicProduct = {
    readonly id?: number;
    product_name: string;
    /**
     * e.g., Samsung, Apple, Dell
     */
    brand?: string;
    /**
     * e.g., S series, Fold, XPS
     */
    model_series?: string;
    product_type?: ProductTypeEnum;
    product_description?: string;
    readonly long_description?: string;
    readonly product_highlights?: Array<string>;
    readonly available_units_count?: string;
    readonly interest_count?: string;
    readonly min_price?: string;
    readonly max_price?: string;
    readonly primary_image?: string;
    /**
     * URL-friendly slug (auto-generated from product_name if not provided)
     */
    slug?: string;
    /**
     * Link to product video (YouTube, Vimeo, etc.)
     */
    product_video_url?: string | null;
    readonly tags?: string;
};

