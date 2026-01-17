/**
 * Serializer for Tag model.
 */
export type PatchedTagRequest = {
    /**
     * Tag name (e.g., 'premium', 'bestseller', 'new')
     */
    name?: string;
    /**
     * URL-friendly slug
     */
    slug?: string;
};
