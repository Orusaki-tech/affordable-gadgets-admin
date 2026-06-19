/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for article images embedded in buying guide body.
 */
export type PatchedArticleImageRequest = {
    article?: number;
    image?: Blob;
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

