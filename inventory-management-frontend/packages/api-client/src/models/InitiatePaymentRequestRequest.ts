/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentModeEnum } from './PaymentModeEnum';
/**
 * Request payload for initiating a Pesapal payment on an existing order.
 */
export type InitiatePaymentRequestRequest = {
    callback_url: string;
    cancellation_url?: string | null;
    customer?: any;
    billing_address?: any;
    /**
     * What to pay for: cart items, delivery, or both.
     *
     * * `ITEMS_ONLY` - ITEMS_ONLY
     * * `DELIVERY_ONLY` - DELIVERY_ONLY
     * * `BOTH` - BOTH
     */
    payment_mode?: PaymentModeEnum;
};

