/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { ProductTypesEnum } from './ProductTypesEnum';
/**
 * Public promotion serializer (limited fields).
 */
export type PublicPromotion = {
    readonly id?: number;
    title: string;
    description?: string;
    readonly banner_image?: string | null;
    readonly banner_image_url?: string | null;
    /**
     * Discount percentage (e.g., 20.00 for 20%)
     */
    discount_percentage?: string | null;
    /**
     * Fixed discount amount
     */
    discount_amount?: string | null;
    readonly discount_display?: string | null;
    start_date: string;
    end_date: string;
    readonly is_currently_active?: boolean;
    /**
     * All products of this type (if specified, applies to all products of this type)
     *
     * * `PH` - Phone
     * * `LT` - Laptop
     * * `TB` - Tablet/iPad
     * * `AC` - Accessory
     */
    product_types?: (ProductTypesEnum | BlankEnum);
    /**
     * List of display locations: 'stories_carousel', 'special_offers', 'flash_sales'
     */
    display_locations?: any;
    /**
     * Position in stories carousel (1-5). 1 = Large banner, 2-5 = Grid positions
     */
    carousel_position?: number | null;
    readonly products?: Array<number>;
};

