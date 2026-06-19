/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArticleImage } from './ArticleImage';
import type { CategoryEnum } from './CategoryEnum';
/**
 * Full product buying guide / blog (staff).
 */
export type ProductArticle = {
    readonly id?: number;
    /**
     * URL segment under /products/{product-slug}/blog/{slug}/
     */
    slug: string;
    category?: CategoryEnum;
    /**
     * Public H1 for the article page (e.g. 'Galaxy A42 5G in Kenya: who should buy it?')
     */
    headline?: string;
    /**
     * Featured image for blog lists and social sharing
     */
    thumbnail_image?: string | null;
    /**
     * Article page title tag (50–60 chars recommended)
     */
    seo_title?: string;
    /**
     * Meta description (150–160 chars recommended)
     */
    seo_description?: string;
    /**
     * Article body (Markdown supported)
     */
    body?: string;
    is_published?: boolean;
    /**
     * Default article for legacy /products/{slug}/blog URLs
     */
    is_primary?: boolean;
    readonly published_at?: string | null;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly images?: Array<ArticleImage>;
};

