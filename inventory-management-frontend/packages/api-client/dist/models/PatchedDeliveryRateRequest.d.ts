/**
 * Serializer for DeliveryRate model (admin).
 */
export type PatchedDeliveryRateRequest = {
    county?: string;
    ward?: string | null;
    price?: string;
    is_active?: boolean;
};
