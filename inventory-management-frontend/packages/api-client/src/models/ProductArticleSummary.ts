/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryEnum } from './CategoryEnum';
/**
 * Article payload for product list — includes body & seo_description so the
 * admin buying-guide editor can populate its form from the list response.
 */
export type ProductArticleSummary = {
    readonly id?: number;
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
    readonly is_published?: boolean;
    /**
     * Default article for legacy /products/{slug}/blog URLs
     */
    readonly is_primary?: boolean;
    readonly published_at?: string | null;
    readonly created_at?: string;
    readonly updated_at?: string;
};

