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
    static pesapalIpnRetrieve(orderMerchantReference, orderNotificationType, orderTrackingId, paymentAccount, paymentMethod, paymentStatusDescription) {
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
    static pesapalIpnCreate() {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pesapal/ipn/',
        });
    }
}
