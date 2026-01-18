import type { DiscountCalculator } from '../models/DiscountCalculator';
import type { DiscountCalculatorRequest } from '../models/DiscountCalculatorRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class UtilsService {
    /**
     * Utility endpoint to calculate a final price based on various discounts and rules.
     * This is a complex business logic endpoint, requiring POST data.
     * @param requestBody
     * @returns DiscountCalculator
     * @throws ApiError
     */
    static utilsDiscountCalculatorCreate(requestBody: DiscountCalculatorRequest): CancelablePromise<DiscountCalculator>;
}
