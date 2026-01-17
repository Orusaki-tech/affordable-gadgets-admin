import type { CancelablePromise } from '../core/CancelablePromise';
export declare class StockAlertsService {
    /**
     * Get all stock alerts.
     * @returns any
     * @throws ApiError
     */
    static stockAlertsRetrieve(): CancelablePromise<Record<string, any>>;
}
