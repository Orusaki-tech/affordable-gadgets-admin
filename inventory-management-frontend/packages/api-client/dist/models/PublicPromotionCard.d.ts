export type PublicPromotionCard = {
    product_id: number;
    product_name: string;
    product_slug: string | null;
    product_image_url: string | null;
    option_summary: string | null;
    original_price: string;
    promotional_price: string;
};
