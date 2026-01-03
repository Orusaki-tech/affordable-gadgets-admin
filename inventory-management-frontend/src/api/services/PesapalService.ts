/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PesapalService {
    /**
     * Handle Pesapal IPN (Instant Payment Notification) callbacks.
     * @returns any No response body
     * @throws ApiError
     */
    public static pesapalIpnRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pesapal/ipn/',
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
