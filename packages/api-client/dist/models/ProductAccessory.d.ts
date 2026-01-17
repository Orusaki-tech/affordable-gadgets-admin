/**
 * Serializer for the intermediary ProductAccessory model.
 */
export type ProductAccessory = {
    readonly id?: number;
    main_product: number;
    accessory: number;
    required_quantity?: number;
    readonly main_product_name?: string;
    readonly accessory_name?: string;
    readonly accessory_slug?: string;
    readonly accessory_primary_image?: string | null;
    readonly accessory_video_url?: string;
    readonly accessory_price_range?: Record<string, number | null>;
    readonly accessory_color_variants?: Array<Record<string, any>>;
};
