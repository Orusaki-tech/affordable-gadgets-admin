import type { PricingModeEnum } from './PricingModeEnum';
export type PatchedBundleRequest = {
    brand?: number;
    /**
     * Primary product this bundle is attached to
     */
    main_product?: number;
    title?: string;
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
};
