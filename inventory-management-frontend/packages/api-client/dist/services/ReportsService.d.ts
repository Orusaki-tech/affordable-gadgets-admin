import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReportsService {
    /**
     * Get aging inventory report.
     * @returns any
     * @throws ApiError
     */
    static reportsAgingInventoryRetrieve(): CancelablePromise<Record<string, any>>;
    /**
     * Get inventory value report.
     * @returns any
     * @throws ApiError
     */
    static reportsInventoryValueRetrieve(): CancelablePromise<Record<string, any>>;
    /**
     * Get product performance report.
     * @returns any
     * @throws ApiError
     */
    static reportsProductPerformanceRetrieve(): CancelablePromise<Record<string, any>>;
    /**
     * Get request management statistics.
     * @returns any
     * @throws ApiError
     */
    static reportsRequestManagementRetrieve(): CancelablePromise<Record<string, any>>;
    /**
     * Get salesperson performance report.
     * @returns any
     * @throws ApiError
     */
    static reportsSalespersonPerformanceRetrieve(): CancelablePromise<Record<string, any>>;
    /**
     * Get stock movement report.
     * @returns any
     * @throws ApiError
     */
    static reportsStockMovementRetrieve(): CancelablePromise<Record<string, any>>;
}
