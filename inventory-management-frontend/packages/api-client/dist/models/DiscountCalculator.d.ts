/**
 * Utility serializer to calculate the discount percentage based on price difference.
 */
export type DiscountCalculator = {
    /**
     * The original selling price of the item.
     */
    original_price: string;
    /**
     * The amount the item is being sold for.
     */
    sale_price: string;
    /**
     * The calculated discount percentage.
     */
    readonly discount_percentage?: string;
};
