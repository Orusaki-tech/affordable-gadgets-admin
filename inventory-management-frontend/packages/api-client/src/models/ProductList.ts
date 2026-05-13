/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductArticleSummary } from './ProductArticleSummary';
import type { ProductTypesEnum } from './ProductTypesEnum';
import type { Tag } from './Tag';
/**
 * Product list: omit full article body (summary only).
 */
export type ProductList = {
    readonly id?: number;
    product_type?: ProductTypesEnum;
    readonly product_type_display?: string;
    product_name: string;
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
     * Shown on the storefront when no online/listable units have a price; used when creating a unit if selling price is omitted.
     */
    default_selling_price?: string | null;
    /**
     * Mark product as discontinued (no longer in catalog)
     */
    is_discontinued?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly created_by?: number | null;
    readonly updated_by?: number | null;
    readonly images?: Array<Record<string, any>>;
    /**
     * SEO title (50-60 chars recommended)
     */
    meta_title?: string;
    /**
     * SEO description (150-160 chars recommended)
     */
    meta_description?: string;
    slug?: string;
    /**
     * Comma-separated keywords for SEO
     */
    keywords?: string;
    /**
     * Social sharing image (Open Graph)
     */
    og_image?: string | null;
    readonly og_image_url?: string | null;
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
    readonly article?: ProductArticleSummary | null;
    /**
     * Link to product video (YouTube, Vimeo, etc.)
     */
    product_video_url?: string | null;
    /**
     * Upload product video file
     */
    product_video_file?: string | null;
    readonly product_video_file_url?: string | null;
    readonly tags?: Array<Tag>;
    readonly brands?: Array<Record<string, any>>;
    /**
     * If True, product is available to all brands regardless of brand assignment
     */
    is_global?: boolean;
    /**
     * Calculate SEO completion score (0-100)
     */
    readonly seo_score?: number;
    readonly available_stock?: number;
};

