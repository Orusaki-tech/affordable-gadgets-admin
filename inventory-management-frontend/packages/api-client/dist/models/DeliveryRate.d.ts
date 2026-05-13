/**
 * Serializer for DeliveryRate model (admin).
 */
export type DeliveryRate = {
    readonly id?: number;
    county: string;
    ward?: string | null;
    price: string;
    is_active?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
};
