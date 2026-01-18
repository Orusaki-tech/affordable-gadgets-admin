/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerLogin } from '../models/CustomerLogin';
import type { CustomerLoginRequest } from '../models/CustomerLoginRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoginService {
    /**
     * POST: Authenticates a user (customer) and returns their authentication token
     * and basic user details (email, user_id).
     * - Uses CustomerLoginSerializer for credential validation and token retrieval.
     * @param requestBody
     * @returns CustomerLogin
     * @throws ApiError
     */
    public static loginCreate(
        requestBody: CustomerLoginRequest,
    ): CancelablePromise<CustomerLogin> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
