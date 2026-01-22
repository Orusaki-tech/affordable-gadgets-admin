/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductTypesEnum } from './ProductTypesEnum';
/**
 * Lightweight product serializer for list endpoints.
 */
export type PublicProductList = {
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
    product_type?: ProductTypesEnum;
    /**
     * Count available units for current brand - use prefetched list for accurate brand filtering.
     */
    readonly available_units_count?: number;
    /**
     * Get min price for available units - use prefetched list for accurate brand filtering.
     */
    readonly min_price?: number;
    /**
     * Get max price for available units - use prefetched list for accurate brand filtering.
     */
    readonly max_price?: number;
    readonly primary_image?: string | null;
    /**
     * URL-friendly slug (auto-generated from product_name if not provided)
     */
    slug?: string;
    /**
     * Link to product video (YouTube, Vimeo, etc.)
     */
    product_video_url?: string | null;
    readonly has_active_bundle?: boolean;
    /**
     * Return minimum effective bundle price for listings (if available).
     */
    readonly bundle_price_preview?: number;
};

