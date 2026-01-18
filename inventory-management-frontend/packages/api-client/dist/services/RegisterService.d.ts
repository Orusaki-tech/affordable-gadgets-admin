import type { CustomerRegistration } from '../models/CustomerRegistration';
import type { CustomerRegistrationRequest } from '../models/CustomerRegistrationRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class RegisterService {
    /**
     * Handles POST requests to /register/ to create a new User and Customer instance.
     * - Uses CustomerRegistrationSerializer for validation and atomic creation.
     * - Does not require authentication (AllowAny).
     * - Returns the created user data and the authentication token.
     * @param requestBody
     * @returns CustomerRegistration
     * @throws ApiError
     */
    static registerCreate(requestBody: CustomerRegistrationRequest): CancelablePromise<CustomerRegistration>;
}
