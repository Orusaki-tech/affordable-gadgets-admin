/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryEnum } from './CategoryEnum';
/**
 * Published buying guide for storefront article page (public read-only).
 */
export type PublicProductArticle = {
    /**
     * URL segment under /products/{product-slug}/blog/{slug}/
     */
    readonly slug?: string;
    readonly category?: CategoryEnum;
    /**
     * Public H1 for the article page (e.g. 'Galaxy A42 5G in Kenya: who should buy it?')
     */
    readonly headline?: string;
    /**
     * Featured image for blog lists and social sharing
     */
    readonly thumbnail_image?: string | null;
    /**
     * Article page title tag (50–60 chars recommended)
     */
    readonly seo_title?: string;
    /**
     * Meta description (150–160 chars recommended)
     */
    readonly seo_description?: string;
    /**
     * Article body (Markdown supported)
     */
    readonly body?: string;
    readonly published_at?: string | null;
    readonly updated_at?: string;
    /**
     * Default article for legacy /products/{slug}/blog URLs
     */
    readonly is_primary?: boolean;
    readonly product_slug?: string;
    readonly product_name?: string;
};

