/**
 * Serializer for LeadItem (admin).
 */
export type LeadItemRequest = {
    inventory_unit: number;
    quantity?: number;
    /**
     * Price at time of lead creation
     */
    unit_price: string;
};
