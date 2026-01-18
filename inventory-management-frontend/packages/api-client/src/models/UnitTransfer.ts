/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReturnRequestStatusEnum } from './ReturnRequestStatusEnum';
/**
 * Serializer for UnitTransfer model.
 */
export type UnitTransfer = {
    readonly id?: number;
    inventory_unit: number;
    readonly inventory_unit_name?: string;
    readonly from_salesperson?: number;
    readonly from_salesperson_username?: string;
    to_salesperson: number;
    readonly to_salesperson_username?: string;
    readonly status?: ReturnRequestStatusEnum;
    readonly status_display?: string;
    readonly requested_at?: string;
    readonly approved_at?: string | null;
    readonly approved_by?: number | null;
    readonly approved_by_username?: string;
    /**
     * Optional notes
     */
    notes?: string;
};

