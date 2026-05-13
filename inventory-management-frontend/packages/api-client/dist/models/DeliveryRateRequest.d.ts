/**
 * Serializer for DeliveryRate model (admin).
 */
export type DeliveryRateRequest = {
    county: string;
    ward?: string | null;
    price: string;
    is_active?: boolean;
};
