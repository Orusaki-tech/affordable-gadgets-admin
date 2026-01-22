export type BundleItem = {
    readonly id?: number;
    bundle: number;
    product: number;
    readonly product_name?: string;
    readonly product_slug?: string;
    quantity?: number;
    /**
     * Optional override price for this item in the bundle
     */
    override_price?: string | null;
    display_order?: number;
    readonly product_primary_image?: string | null;
};
