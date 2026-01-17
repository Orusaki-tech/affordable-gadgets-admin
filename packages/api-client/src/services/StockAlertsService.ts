/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StockAlertsService {
    /**
     * Get all stock alerts.
     * @returns any
     * @throws ApiError
     */
    public static stockAlertsRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stock-alerts/',
        });
    }
}
