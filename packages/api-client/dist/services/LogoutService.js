import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogoutService {
    /**
     * POST: Logs out the user by deleting their authentication token.
     * Requires authentication (IsAuthenticated) via the provided token header.
     * @returns any
     * @throws ApiError
     */
    static logoutCreate() {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/logout/',
        });
    }
}
