/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiscountCalculator } from '../models/DiscountCalculator';
import type { DiscountCalculatorRequest } from '../models/DiscountCalculatorRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UtilsService {
    /**
     * Utility endpoint to calculate a final price based on various discounts and rules.
     * This is a complex business logic endpoint, requiring POST data.
     * @param requestBody
     * @returns DiscountCalculator
     * @throws ApiError
     */
    public static utilsDiscountCalculatorCreate(
        requestBody: DiscountCalculatorRequest,
    ): CancelablePromise<DiscountCalculator> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/utils/discount-calculator/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
