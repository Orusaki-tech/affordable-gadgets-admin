/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerRegistration } from '../models/CustomerRegistration';
import type { CustomerRegistrationRequest } from '../models/CustomerRegistrationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RegisterService {
    /**
     * Handles POST requests to /register/ to create a new User and Customer instance.
     * - Uses CustomerRegistrationSerializer for validation and atomic creation.
     * - Does not require authentication (AllowAny).
     * - Returns the created user data and the authentication token.
     * @param requestBody
     * @returns CustomerRegistration
     * @throws ApiError
     */
    public static registerCreate(
        requestBody: CustomerRegistrationRequest,
    ): CancelablePromise<CustomerRegistration> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
