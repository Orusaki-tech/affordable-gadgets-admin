/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request payload for initiating a Pesapal payment on an existing order.
 */
export type InitiatePaymentRequestRequest = {
    callback_url: string;
    cancellation_url?: string | null;
    customer?: any;
    billing_address?: any;
};

