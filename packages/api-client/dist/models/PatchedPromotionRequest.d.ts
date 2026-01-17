import type { BlankEnum } from './BlankEnum';
import type { ProductTypesEnum } from './ProductTypesEnum';
/**
 * Serializer for Promotion model (admin).
 */
export type PatchedPromotionRequest = {
    brand?: number;
    /**
     * Type of promotion (Special Offer, Flash Sale, etc.)
     */
    promotion_type?: number | null;
    title?: string;
    description?: string;
    banner_image?: Blob | null;
    /**
     * Auto-generated promotion code (editable)
     */
    promotion_code?: string;
    /**
     * List of display locations: 'stories_carousel', 'special_offers', 'flash_sales'
     */
    display_locations?: any;
    /**
     * Position in stories carousel (1-5). 1 = Large banner, 2-5 = Grid positions
     */
    carousel_position?: number | null;
    /**
     * Discount percentage (e.g., 20.00 for 20%)
     */
    discount_percentage?: string | null;
    /**
     * Fixed discount amount
     */
    discount_amount?: string | null;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    /**
     * Specific products this promotion applies to
     */
    products?: Array<number>;
    /**
     * All products of this type (if specified, applies to all products of this type)
     *
     * * `PH` - Phone
     * * `LT` - Laptop
     * * `TB` - Tablet/iPad
     * * `AC` - Accessory
     */
    product_types?: (ProductTypesEnum | BlankEnum);
    created_by?: number | null;
};
