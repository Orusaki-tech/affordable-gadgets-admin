/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for PromotionType model.
 */
export type PromotionType = {
    readonly id?: number;
    /**
     * Display name (e.g., 'Special Offer', 'Flash Sale')
     */
    name: string;
    /**
     * Short code (e.g., 'SO', 'FS')
     */
    code: string;
    /**
     * Description of this promotion type
     */
    description?: string;
    /**
     * Whether this type is available for use
     */
    is_active?: boolean;
    /**
     * Order for display in dropdowns
     */
    display_order?: number;
    readonly created_at?: string;
    readonly updated_at?: string;
};

