/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedPublicInventoryUnitAdminList } from '../models/PaginatedPublicInventoryUnitAdminList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PhoneSearchService {
    /**
     * GET: Allows customers to search for available phone Inventory Units
     * within a specified budget range.
     *
     * Query Params required:
     * - min_price (required, decimal)
     * - max_price (required, decimal)
     *
     * Example URL: /api/phone-search/?min_price=15000&max_price=30000
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicInventoryUnitAdminList
     * @throws ApiError
     */
    public static phoneSearchList(
        page?: number,
    ): CancelablePromise<PaginatedPublicInventoryUnitAdminList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/phone-search/',
            query: {
                'page': page,
            },
        });
    }
}
