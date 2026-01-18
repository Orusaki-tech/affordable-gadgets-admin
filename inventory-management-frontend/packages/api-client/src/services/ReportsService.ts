/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Get aging inventory report.
     * @returns any
     * @throws ApiError
     */
    public static reportsAgingInventoryRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/aging_inventory/',
        });
    }
    /**
     * Get inventory value report.
     * @returns any
     * @throws ApiError
     */
    public static reportsInventoryValueRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/inventory_value/',
        });
    }
    /**
     * Get product performance report.
     * @returns any
     * @throws ApiError
     */
    public static reportsProductPerformanceRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/product_performance/',
        });
    }
    /**
     * Get request management statistics.
     * @returns any
     * @throws ApiError
     */
    public static reportsRequestManagementRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/request_management/',
        });
    }
    /**
     * Get salesperson performance report.
     * @returns any
     * @throws ApiError
     */
    public static reportsSalespersonPerformanceRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/salesperson_performance/',
        });
    }
    /**
     * Get stock movement report.
     * @returns any
     * @throws ApiError
     */
    public static reportsStockMovementRetrieve(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/stock_movement/',
        });
    }
}
