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
    static registerCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
