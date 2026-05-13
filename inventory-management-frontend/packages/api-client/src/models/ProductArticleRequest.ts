/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Full product buying guide / blog (staff).
 */
export type ProductArticleRequest = {
    /**
     * Public H1 for the article page
     */
    headline?: string;
    /**
     * Article page title tag (50–60 chars recommended)
     */
    seo_title?: string;
    /**
     * Meta description (150–160 chars recommended)
     */
    seo_description?: string;
    /**
     * Article body (Markdown)
     */
    body?: string;
    is_published?: boolean;
};

