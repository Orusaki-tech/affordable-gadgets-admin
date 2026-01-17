import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StockAlertsService {
    /**
     * Get all stock alerts.
     * @returns any
     * @throws ApiError
     */
    static stockAlertsRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/stock-alerts/',
        });
    }
}
