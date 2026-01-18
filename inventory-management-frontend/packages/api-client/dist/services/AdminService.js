import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminService {
    /**
     * Fix all inventory units to be available.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static adminFixProductVisibilityCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/fix-product-visibility/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
