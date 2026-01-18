import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfilesService {
    /**
     * GET: Retrieve the authenticated user's Admin profile. Admin-only access.
     * Creates Admin profile if it doesn't exist (for staff users without Admin profile).
     * @returns Admin
     * @throws ApiError
     */
    static profilesAdminRetrieve() {
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
    static profilesCustomerRetrieve() {
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
    static profilesCustomerUpdate(requestBody) {
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
    static profilesCustomerPartialUpdate(requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/profiles/customer/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
