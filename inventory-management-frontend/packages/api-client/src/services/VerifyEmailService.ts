/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VerifyEmailService {
    /**
     * POST: Verifies a customer's email using uid and token.
     * @returns any No response body
     * @throws ApiError
     */
    public static verifyEmailCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/verify-email/',
        });
    }
    /**
     * POST: Re-send verification email for a customer.
     * @returns any No response body
     * @throws ApiError
     */
    public static verifyEmailResendCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/verify-email/resend/',
        });
    }
}
