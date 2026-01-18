import type { ReturnRequestStatusEnum } from './ReturnRequestStatusEnum';
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
    /**
     * Return count of units in this return request.
     */
    readonly inventory_units_count?: number;
    readonly inventory_units_detail?: Array<Record<string, any>>;
    readonly transfer_history?: Array<Record<string, any>>;
    readonly net_holdings_info?: Record<string, number>;
    status?: ReturnRequestStatusEnum;
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
