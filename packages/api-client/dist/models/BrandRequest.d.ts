/**
 * Serializer for Brand model.
 */
export type BrandRequest = {
    code: string;
    name: string;
    description?: string;
    is_active?: boolean;
    logo?: Blob | null;
    /**
     * Hex color code
     */
    primary_color?: string;
    /**
     * Domain for this brand's e-commerce site
     */
    ecommerce_domain?: string;
};
