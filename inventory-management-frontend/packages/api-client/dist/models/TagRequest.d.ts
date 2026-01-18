/**
 * Serializer for Tag model.
 */
export type TagRequest = {
    /**
     * Tag name (e.g., 'premium', 'bestseller', 'new')
     */
    name: string;
    /**
     * URL-friendly slug
     */
    slug: string;
};
