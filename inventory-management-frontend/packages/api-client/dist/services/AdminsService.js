import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminsService {
    /**
     * Admin management ViewSet. Superuser-only access.
     * - List all admins
     * - Create new admin accounts
     * - Retrieve/Update/Delete admin profiles
     * - Assign/remove roles
     * @param page A page number within the paginated result set.
     * @returns PaginatedAdminList
     * @throws ApiError
     */
    static adminsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admins/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Override create to provide better error handling.
     * @param requestBody
     * @returns AdminCreate
     * @throws ApiError
     */
    static adminsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admins/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Admin management ViewSet. Superuser-only access.
     * - List all admins
     * - Create new admin accounts
     * - Retrieve/Update/Delete admin profiles
     * - Assign/remove roles
     * @param id A unique integer value identifying this admin.
     * @returns Admin
     * @throws ApiError
     */
    static adminsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admins/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Admin management ViewSet. Superuser-only access.
     * - List all admins
     * - Create new admin accounts
     * - Retrieve/Update/Delete admin profiles
     * - Assign/remove roles
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admins/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Admin management ViewSet. Superuser-only access.
     * - List all admins
     * - Create new admin accounts
     * - Retrieve/Update/Delete admin profiles
     * - Assign/remove roles
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/admins/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Admin management ViewSet. Superuser-only access.
     * - List all admins
     * - Create new admin accounts
     * - Retrieve/Update/Delete admin profiles
     * - Assign/remove roles
     * @param id A unique integer value identifying this admin.
     * @returns void
     * @throws ApiError
     */
    static adminsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admins/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Assign or update brands for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsBrandsCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admins/{id}/brands/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Assign or update brands for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsBrandsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admins/{id}/brands/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Assign or update roles for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsRolesCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admins/{id}/roles/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Assign or update roles for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsRolesUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admins/{id}/roles/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
