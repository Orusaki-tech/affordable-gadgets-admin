/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Lightweight article payload for product list (no body).
 */
export type ProductArticleSummary = {
    /**
     * Public H1 for the article page
     */
    readonly headline?: string;
    /**
     * Article page title tag (50–60 chars recommended)
     */
    readonly seo_title?: string;
    readonly is_published?: boolean;
    readonly published_at?: string | null;
    readonly created_at?: string;
    readonly updated_at?: string;
};

