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
    readonly financing_available?: boolean;
    /**
     * Count available units for current brand - use prefetched list for accurate brand filtering.
     */
    readonly available_units_count?: number;
    /**
     * Get min price for available units; fall back to Product.default_selling_price when none.
     */
    readonly min_price?: number;
    /**
     * Get max price for available units; fall back to Product.default_selling_price when none.
     */
    readonly max_price?: number;
    /**
     * Get min compare-at price for available units.
     */
    readonly compare_at_min_price?: number;
    /**
     * Get max compare-at price for available units.
     */
    readonly compare_at_max_price?: number;
    readonly discount_percent?: number;
    readonly review_count?: number;
    readonly average_rating?: number;
    readonly primary_image?: string | null;
    /**
     * URL-friendly slug (auto-generated from product_name if not provided)
     */
    slug?: string;
    /**
     * Link to product video (YouTube, Vimeo, etc.)
     */
    product_video_url?: string | null;
    readonly product_video_file_url?: string | null;
    readonly has_active_bundle?: boolean;
    /**
     * Return minimum effective bundle price for listings (if available).
     */
    readonly bundle_price_preview?: number;
    readonly has_published_article?: boolean;
    readonly published_article_count?: number;
};

