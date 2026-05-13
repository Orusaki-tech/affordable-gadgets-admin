import type { CancelablePromise } from '../core/CancelablePromise';
export declare class VerifyEmailService {
    /**
     * POST: Verifies a customer's email using uid and token.
     * @returns any No response body
     * @throws ApiError
     */
    static verifyEmailCreate(): CancelablePromise<any>;
    /**
     * POST: Re-send verification email for a customer.
     * @returns any No response body
     * @throws ApiError
     */
    static verifyEmailResendCreate(): CancelablePromise<any>;
}
