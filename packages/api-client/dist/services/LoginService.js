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
    static loginCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
