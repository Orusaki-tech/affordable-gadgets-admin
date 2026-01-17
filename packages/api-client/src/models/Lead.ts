/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeadItem } from './LeadItem';
import type { LeadStatusEnum } from './LeadStatusEnum';
/**
 * Serializer for Lead model (admin).
 */
export type Lead = {
    readonly id?: number;
    readonly lead_reference?: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    delivery_address?: string;
    customer?: number | null;
    brand: number;
    readonly brand_name?: string;
    readonly submitted_at?: string;
    status?: LeadStatusEnum;
    readonly status_display?: string;
    assigned_salesperson?: number | null;
    readonly assigned_salesperson_name?: string | null;
    contacted_at?: string | null;
    readonly converted_at?: string | null;
    order?: string | null;
    readonly order_id?: string | null;
    salesperson_notes?: string;
    /**
     * Any notes from customer during submission
     */
    customer_notes?: string;
    total_value?: string;
    expires_at?: string | null;
    readonly items?: Array<LeadItem>;
    readonly customer_name_display?: string | null;
};

