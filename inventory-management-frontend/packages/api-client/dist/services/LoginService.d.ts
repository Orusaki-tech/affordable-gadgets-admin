import type { CustomerLogin } from '../models/CustomerLogin';
import type { CustomerLoginRequest } from '../models/CustomerLoginRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LoginService {
    /**
     * POST: Authenticates a user (customer) and returns their authentication token
     * and basic user details (email, user_id).
     * - Uses CustomerLoginSerializer for credential validation and token retrieval.
     * @param requestBody
     * @returns CustomerLogin
     * @throws ApiError
     */
    static loginCreate(requestBody: CustomerLoginRequest): CancelablePromise<CustomerLogin>;
}
