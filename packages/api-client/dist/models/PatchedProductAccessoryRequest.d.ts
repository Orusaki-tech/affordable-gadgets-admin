/**
 * Serializer for the intermediary ProductAccessory model.
 */
export type PatchedProductAccessoryRequest = {
    main_product?: number;
    accessory?: number;
    required_quantity?: number;
};
