import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LogoutService {
    /**
     * POST: Logs out the user by deleting their authentication token.
     * Requires authentication (IsAuthenticated) via the provided token header.
     * @returns any
     * @throws ApiError
     */
    static logoutCreate(): CancelablePromise<Record<string, any>>;
}
