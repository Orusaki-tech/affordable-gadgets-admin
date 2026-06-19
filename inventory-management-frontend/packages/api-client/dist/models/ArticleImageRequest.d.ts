/**
 * Serializer for article images embedded in buying guide body.
 */
export type ArticleImageRequest = {
    article: number;
    image: Blob;
    /**
     * Required for SEO and accessibility
     */
    alt_text?: string;
    /**
     * Optional caption for the image
     */
    caption?: string;
    /**
     * Order in which images should be displayed (lower numbers first)
     */
    position?: number;
};
