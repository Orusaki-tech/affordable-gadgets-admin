/**
 * Serializer for Product images.
 * - Read: returns computed image_url for display and product ID
 * - Write (admin-only): accepts product and image to create a new image
 */
export type ProductImageRequest = {
    product: number;
    image: Blob;
    is_primary?: boolean;
    /**
     * Required for SEO and accessibility
     */
    alt_text?: string;
    /**
     * Optional caption for the image
     */
    image_caption?: string;
    /**
     * Order in which images should be displayed (lower numbers first)
     */
    display_order?: number;
};
