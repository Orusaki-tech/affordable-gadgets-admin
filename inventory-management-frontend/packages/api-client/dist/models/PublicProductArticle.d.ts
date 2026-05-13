/**
 * Published buying guide for storefront article page (public read-only).
 */
export type PublicProductArticle = {
    /**
     * Public H1 for the article page
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
     * Article body (Markdown)
     */
    readonly body?: string;
    readonly published_at?: string | null;
    readonly updated_at?: string;
};
