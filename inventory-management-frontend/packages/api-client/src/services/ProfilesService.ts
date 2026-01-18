/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Admin } from '../models/Admin';
import type { CustomerProfileUpdate } from '../models/CustomerProfileUpdate';
import type { CustomerProfileUpdateRequest } from '../models/CustomerProfileUpdateRequest';
import type { PatchedCustomerProfileUpdateRequest } from '../models/PatchedCustomerProfileUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfilesService {
    /**
     * GET: Retrieve the authenticated user's Admin profile. Admin-only access.
     * Creates Admin profile if it doesn't exist (for staff users without Admin profile).
     * @returns Admin
     * @throws ApiError
     */
    public static profilesAdminRetrieve(): CancelablePromise<Admin> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/admin/',
        });
    }
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    public static profilesCustomerRetrieve(): CancelablePromise<CustomerProfileUpdate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/customer/',
        });
    }
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @param requestBody
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    public static profilesCustomerUpdate(
        requestBody?: CustomerProfileUpdateRequest,
    ): CancelablePromise<CustomerProfileUpdate> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/profiles/customer/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @param requestBody
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    public static profilesCustomerPartialUpdate(
        requestBody?: PatchedCustomerProfileUpdateRequest,
    ): CancelablePromise<CustomerProfileUpdate> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/profiles/customer/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
