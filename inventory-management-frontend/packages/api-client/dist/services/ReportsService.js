import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Get aging inventory report.
     * @returns any
     * @throws ApiError
     */
    static reportsAgingInventoryRetrieve() {
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
    static reportsInventoryValueRetrieve() {
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
    static reportsProductPerformanceRetrieve() {
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
    static reportsRequestManagementRetrieve() {
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
    static reportsSalespersonPerformanceRetrieve() {
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
    static reportsStockMovementRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/stock_movement/',
        });
    }
}
