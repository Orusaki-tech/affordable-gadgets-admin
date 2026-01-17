/**
 * Serializer for UnitTransfer model.
 */
export type UnitTransferRequest = {
    inventory_unit: number;
    inventory_unit_id: number;
    to_salesperson: number;
    to_salesperson_id: number;
    /**
     * Optional notes
     */
    notes?: string;
};
