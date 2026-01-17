/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogoutService {
    /**
     * POST: Logs out the user by deleting their authentication token.
     * Requires authentication (IsAuthenticated) via the provided token header.
     * @returns any
     * @throws ApiError
     */
    public static logoutCreate(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/logout/',
        });
    }
}
