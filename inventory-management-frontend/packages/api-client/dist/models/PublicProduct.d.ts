import type { ProductTypesEnum } from './ProductTypesEnum';
import type { PublicFinancingOffer } from './PublicFinancingOffer';
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
    product_type?: ProductTypesEnum;
    product_description?: string;
    readonly long_description?: string;
    readonly product_highlights?: Array<string>;
    readonly financing_available?: boolean;
    readonly financing_offers?: Array<PublicFinancingOffer>;
    /**
     * Count available units for current brand - use prefetched list for accurate brand filtering.
     */
    readonly available_units_count?: number;
    /**
     * Get total interest count for product - optimized version.
     */
    readonly interest_count?: number;
    /**
     * Get min price for available units - use annotation when present (list), else prefetched list or query.
     */
    readonly min_price?: number;
    /**
     * Get max price for available units - use annotation when present (list), else prefetched list or query.
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
    readonly tags?: Array<string>;
    readonly has_active_bundle?: boolean;
    /**
     * Return minimum effective bundle price for listings (if available).
     */
    readonly bundle_price_preview?: number;
    /**
     * SEO title (50-60 chars recommended)
     */
    meta_title?: string;
    /**
     * SEO description (150-160 chars recommended)
     */
    meta_description?: string;
    readonly has_published_article?: boolean;
    readonly article_headline?: string | null;
};
