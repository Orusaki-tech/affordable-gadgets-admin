import type { CancelablePromise } from '../core/CancelablePromise';
export declare class PesapalService {
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
    static pesapalIpnRetrieve(orderMerchantReference?: string, orderNotificationType?: string, orderTrackingId?: string, paymentAccount?: string, paymentMethod?: string, paymentStatusDescription?: string): CancelablePromise<Record<string, any>>;
    /**
     * Handle POST IPN (if Pesapal sends POST instead of GET).
     * @returns any No response body
     * @throws ApiError
     */
    static pesapalIpnCreate(): CancelablePromise<any>;
}
