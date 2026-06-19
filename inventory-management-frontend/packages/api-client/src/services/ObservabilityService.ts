/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ObservabilityService {
    /**
     * Internal API endpoint for Grafana JSON API datasource.
     * Provides snapshot analytics of current active (unsubmitted) carts.
     * @returns any No response body
     * @throws ApiError
     */
    public static observabilityCartAnalyticsRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/observability/cart-analytics/',
        });
    }
    /**
     * Public endpoint to record user activity events.
     * Accepts optional session_key for anonymous tracking before login.
     * @returns any No response body
     * @throws ApiError
     */
    public static observabilityRecordEventCreate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/observability/record-event/',
        });
    }
}
