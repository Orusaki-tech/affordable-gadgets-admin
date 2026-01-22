export type PatchedBundleItemRequest = {
    bundle?: number;
    product?: number;
    quantity?: number;
    /**
     * Optional override price for this item in the bundle
     */
    override_price?: string | null;
    display_order?: number;
};
