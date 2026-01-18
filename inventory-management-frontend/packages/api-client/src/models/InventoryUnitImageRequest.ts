/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for Inventory Unit images.
 * - Read: returns computed image_url for display
 * - Write (admin-only): accepts inventory_unit and image to create a new image
 */
export type InventoryUnitImageRequest = {
    inventory_unit: number;
    image: Blob;
    is_primary?: boolean;
    color_id?: number | null;
};

