/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Color } from './Color';
/**
 * Serializer for Inventory Unit images.
 * - Read: returns computed image_url for display
 * - Write (admin-only): accepts inventory_unit and image to create a new image
 */
export type InventoryUnitImage = {
    readonly id?: number;
    is_primary?: boolean;
    readonly image_url?: string | null;
    readonly color?: Color;
    readonly color_name?: string;
    readonly created_at?: string;
};

