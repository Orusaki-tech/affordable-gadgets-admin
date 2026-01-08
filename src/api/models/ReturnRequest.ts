/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status214Enum } from './Status214Enum';
/**
 * Serializer for ReturnRequest model (bulk returns).
 */
export type ReturnRequest = {
    readonly id?: number;
    /**
     * Salesperson requesting return. Null for buyback units (auto-created).
     */
    readonly requesting_salesperson?: number | null;
    readonly requesting_salesperson_username?: string;
    readonly inventory_units?: Array<number>;
    readonly inventory_units_count?: string;
    readonly inventory_units_detail?: string;
    readonly transfer_history?: string;
    readonly net_holdings_info?: string;
    status?: Status214Enum;
    readonly status_display?: string;
    readonly requested_at?: string;
    readonly approved_at?: string | null;
    readonly approved_by?: number | null;
    readonly approved_by_username?: string;
    /**
     * Optional notes from salesperson
     */
    notes?: string;
};

