import type { BundleItem } from './BundleItem';
import type { PricingModeEnum } from './PricingModeEnum';
export type Bundle = {
    readonly id?: number;
    brand: number;
    readonly brand_name?: string;
    /**
     * Primary product this bundle is attached to
     */
    main_product: number;
    readonly main_product_name?: string;
    title: string;
    description?: string;
    is_active?: boolean;
    start_date?: string | null;
    end_date?: string | null;
    pricing_mode?: PricingModeEnum;
    /**
     * Total bundle price (required for Fixed pricing)
     */
    bundle_price?: string | null;
    /**
     * Percentage discount on items total (for Percentage pricing)
     */
    discount_percentage?: string | null;
    /**
     * Fixed discount amount on items total (for Amount pricing)
     */
    discount_amount?: string | null;
    /**
     * Show bundle badge in search/category lists
     */
    show_in_listings?: boolean;
    created_by?: number | null;
    readonly created_at?: string;
    readonly updated_at?: string;
    readonly items?: Array<BundleItem>;
    readonly is_currently_active?: boolean;
};
