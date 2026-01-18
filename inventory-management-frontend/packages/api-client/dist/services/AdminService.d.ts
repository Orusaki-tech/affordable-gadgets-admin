import type { FixProductVisibilityRequest } from '../models/FixProductVisibilityRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AdminService {
    /**
     * Fix all inventory units to be available.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static adminFixProductVisibilityCreate(requestBody?: FixProductVisibilityRequest): CancelablePromise<Record<string, any>>;
}
