/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PesapalService {
    /**
     * Handle Pesapal IPN (Instant Payment Notification) callbacks.
     * @param orderMerchantReference
     * @param orderNotificationType
     * @param orderTrackingId
     * @param paymentAccount
     * @param paymentMethod
     * @param paymentStatusDescription
     * @returns any
     * @throws ApiError
     */
    public static pesapalIpnRetrieve(
        orderMerchantReference?: string,
        orderNotificationType?: string,
        orderTrackingId?: string,
        paymentAccount?: string,
        paymentMethod?: string,
        paymentStatusDescription?: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pesapal/ipn/',
            query: {
                'OrderMerchantReference': orderMerchantReference,
                'OrderNotificationType': orderNotificationType,
                'OrderTrackingId': orderTrackingId,
                'PaymentAccount': paymentAccount,
                'PaymentMethod': paymentMethod,
                'PaymentStatusDescription': paymentStatusDescription,
            },
        });
    }
    /**
     * Handle POST IPN (if Pesapal sends POST instead of GET).
     * @returns any No response body
     * @throws ApiError
     */
    public static pesapalIpnCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pesapal/ipn/',
        });
    }
}
