/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FixProductVisibilityRequest } from '../models/FixProductVisibilityRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Fix all inventory units to be available.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static adminFixProductVisibilityCreate(
        requestBody?: FixProductVisibilityRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/fix-product-visibility/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
