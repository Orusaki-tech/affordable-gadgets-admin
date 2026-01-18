/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeadStatusEnum } from './LeadStatusEnum';
/**
 * Serializer for Lead model (admin).
 */
export type PatchedLeadRequest = {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string | null;
    delivery_address?: string;
    customer?: number | null;
    brand?: number;
    status?: LeadStatusEnum;
    assigned_salesperson?: number | null;
    contacted_at?: string | null;
    order?: string | null;
    salesperson_notes?: string;
    /**
     * Any notes from customer during submission
     */
    customer_notes?: string;
    total_value?: string;
    expires_at?: string | null;
};

