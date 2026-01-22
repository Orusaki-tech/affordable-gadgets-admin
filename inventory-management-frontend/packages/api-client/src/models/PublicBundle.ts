/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PricingModeEnum } from './PricingModeEnum';
import type { PublicBundleItem } from './PublicBundleItem';
export type PublicBundle = {
    readonly id?: number;
    brand: number;
    readonly main_product_id?: number;
    readonly main_product_name?: string;
    readonly main_product_slug?: string;
    title: string;
    description?: string;
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
    readonly is_currently_active?: boolean;
    readonly items?: Array<PublicBundleItem>;
    readonly items_min_total?: number;
    readonly items_max_total?: number;
};

