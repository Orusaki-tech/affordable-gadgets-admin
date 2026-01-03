/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusC79Enum } from './StatusC79Enum';
/**
 * Serializer for ReservationRequest model.
 */
export type ReservationRequest = {
    readonly id?: number;
    readonly requesting_salesperson?: number;
    readonly requesting_salesperson_username?: string;
    readonly requesting_salesperson_brands?: string;
    readonly inventory_unit?: number | null;
    readonly inventory_unit_name?: string;
    /**
     * Inventory units in this reservation request
     */
    readonly inventory_units?: Array<number>;
    readonly inventory_units_details?: string;
    status?: StatusC79Enum;
    readonly status_display?: string;
    readonly requested_at?: string;
    readonly approved_at?: string | null;
    /**
     * Auto-set to 2 days after approval
     */
    readonly expires_at?: string | null;
    readonly approved_by?: number | null;
    readonly approved_by_username?: string;
    /**
     * Additional notes or comments
     */
    notes?: string;
};

