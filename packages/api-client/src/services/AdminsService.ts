/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Admin } from '../models/Admin';
import type { AdminCreate } from '../models/AdminCreate';
import type { AdminCreateRequest } from '../models/AdminCreateRequest';
import type { AdminRequest } from '../models/AdminRequest';
import type { PaginatedAdminList } from '../models/PaginatedAdminList';
import type { PatchedAdminRequest } from '../models/PatchedAdminRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static adminsList(
        page?: number,
    ): CancelablePromise<PaginatedAdminList> {
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
    public static adminsCreate(
        requestBody: AdminCreateRequest,
    ): CancelablePromise<AdminCreate> {
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
    public static adminsRetrieve(
        id: number,
    ): CancelablePromise<Admin> {
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
    public static adminsUpdate(
        id: number,
        requestBody: AdminRequest,
    ): CancelablePromise<Admin> {
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
    public static adminsPartialUpdate(
        id: number,
        requestBody?: PatchedAdminRequest,
    ): CancelablePromise<Admin> {
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
    public static adminsDestroy(
        id: number,
    ): CancelablePromise<void> {
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
    public static adminsBrandsCreate(
        id: number,
        requestBody: AdminRequest,
    ): CancelablePromise<Admin> {
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
    public static adminsBrandsUpdate(
        id: number,
        requestBody: AdminRequest,
    ): CancelablePromise<Admin> {
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
    public static adminsRolesCreate(
        id: number,
        requestBody: AdminRequest,
    ): CancelablePromise<Admin> {
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
    public static adminsRolesUpdate(
        id: number,
        requestBody: AdminRequest,
    ): CancelablePromise<Admin> {
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
