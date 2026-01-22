export type PublicBundleItem = {
    readonly id?: number;
    readonly product_id?: number;
    readonly product_name?: string;
    readonly product_slug?: string;
    readonly product_type?: string;
    quantity?: number;
    /**
     * Optional override price for this item in the bundle
     */
    override_price?: string | null;
    display_order?: number;
    readonly primary_image?: string | null;
    readonly min_price?: number;
    readonly max_price?: number;
};
