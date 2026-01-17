/**
 * Serializer for Tag model.
 */
export type Tag = {
    readonly id?: number;
    /**
     * Tag name (e.g., 'premium', 'bestseller', 'new')
     */
    name: string;
    /**
     * URL-friendly slug
     */
    slug: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};
