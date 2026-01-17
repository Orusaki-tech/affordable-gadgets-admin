import type { ProductTypesEnum } from './ProductTypesEnum';
/**
 * Serializes the generic Product template.
 */
export type PatchedProductRequest = {
    product_type?: ProductTypesEnum;
    product_name?: string;
    product_description?: string;
    /**
     * e.g., Samsung, Apple, Dell
     */
    brand?: string;
    /**
     * e.g., S series, Fold, XPS
     */
    model_series?: string;
    /**
     * Minimum stock level before triggering low stock alert
     */
    min_stock_threshold?: number | null;
    /**
     * Stock level at which to reorder/restock
     */
    reorder_point?: number | null;
    /**
     * Mark product as discontinued (no longer in catalog)
     */
    is_discontinued?: boolean;
    /**
     * SEO title (50-60 chars recommended)
     */
    meta_title?: string;
    /**
     * SEO description (150-160 chars recommended)
     */
    meta_description?: string;
    /**
     * URL-friendly slug (auto-generated from product_name if not provided)
     */
    slug?: string;
    /**
     * Comma-separated keywords for SEO
     */
    keywords?: string;
    /**
     * Social sharing image (Open Graph)
     */
    og_image?: Blob | null;
    /**
     * List of key features/highlights (bullet points)
     */
    product_highlights?: any;
    /**
     * Extended product description for detailed content
     */
    long_description?: string;
    /**
     * Whether product is published (visible on e-commerce site)
     */
    is_published?: boolean;
    /**
     * Link to product video (YouTube, Vimeo, etc.)
     */
    product_video_url?: string | null;
    /**
     * Upload product video file
     */
    product_video_file?: Blob | null;
    tag_ids?: Array<number>;
    /**
     * List of Brand IDs this product is available for. Empty = available to all brands.
     */
    brand_ids?: Array<number>;
    /**
     * If True, product is available to all brands regardless of brand assignment
     */
    is_global?: boolean;
};
