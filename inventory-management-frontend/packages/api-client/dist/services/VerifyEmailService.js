import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VerifyEmailService {
    /**
     * POST: Verifies a customer's email using uid and token.
     * @returns any No response body
     * @throws ApiError
     */
    static verifyEmailCreate() {
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
    static verifyEmailResendCreate() {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/verify-email/resend/',
        });
    }
}
