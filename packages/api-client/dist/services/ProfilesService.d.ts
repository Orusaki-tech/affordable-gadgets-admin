import type { Admin } from '../models/Admin';
import type { CustomerProfileUpdate } from '../models/CustomerProfileUpdate';
import type { CustomerProfileUpdateRequest } from '../models/CustomerProfileUpdateRequest';
import type { PatchedCustomerProfileUpdateRequest } from '../models/PatchedCustomerProfileUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProfilesService {
    /**
     * GET: Retrieve the authenticated user's Admin profile. Admin-only access.
     * Creates Admin profile if it doesn't exist (for staff users without Admin profile).
     * @returns Admin
     * @throws ApiError
     */
    static profilesAdminRetrieve(): CancelablePromise<Admin>;
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    static profilesCustomerRetrieve(): CancelablePromise<CustomerProfileUpdate>;
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @param requestBody
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    static profilesCustomerUpdate(requestBody?: CustomerProfileUpdateRequest): CancelablePromise<CustomerProfileUpdate>;
    /**
     * GET: Retrieve the authenticated user's Customer profile.
     * PUT/PATCH: Update the authenticated user's Customer profile.
     * Uses IsCustomerOwnerOrAdmin.
     * @param requestBody
     * @returns CustomerProfileUpdate
     * @throws ApiError
     */
    static profilesCustomerPartialUpdate(requestBody?: PatchedCustomerProfileUpdateRequest): CancelablePromise<CustomerProfileUpdate>;
}
