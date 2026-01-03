/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicInventoryUnit } from './PublicInventoryUnit';
/**
 * Cart item serializer.
 */
export type CartItem = {
    readonly id?: number;
    readonly inventory_unit?: PublicInventoryUnit;
    quantity?: number;
    readonly unit_price?: string;
    readonly promotion_id?: number | null;
};

