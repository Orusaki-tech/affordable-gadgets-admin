/**
 * Serializer for the intermediary ProductAccessory model.
 */
export type ProductAccessoryRequest = {
    main_product: number;
    accessory: number;
    required_quantity?: number;
};
