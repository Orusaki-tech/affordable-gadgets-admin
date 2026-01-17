import type { Admin } from '../models/Admin';
import type { AdminCreate } from '../models/AdminCreate';
import type { AdminCreateRequest } from '../models/AdminCreateRequest';
import type { AdminRequest } from '../models/AdminRequest';
import type { PaginatedAdminList } from '../models/PaginatedAdminList';
import type { PatchedAdminRequest } from '../models/PatchedAdminRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AdminsService {
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
    static adminsList(page?: number): CancelablePromise<PaginatedAdminList>;
    /**
     * Override create to provide better error handling.
     * @param requestBody
     * @returns AdminCreate
     * @throws ApiError
     */
    static adminsCreate(requestBody: AdminCreateRequest): CancelablePromise<AdminCreate>;
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
    static adminsRetrieve(id: number): CancelablePromise<Admin>;
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
    static adminsUpdate(id: number, requestBody: AdminRequest): CancelablePromise<Admin>;
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
    static adminsPartialUpdate(id: number, requestBody?: PatchedAdminRequest): CancelablePromise<Admin>;
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
    static adminsDestroy(id: number): CancelablePromise<void>;
    /**
     * Assign or update brands for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsBrandsCreate(id: number, requestBody: AdminRequest): CancelablePromise<Admin>;
    /**
     * Assign or update brands for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsBrandsUpdate(id: number, requestBody: AdminRequest): CancelablePromise<Admin>;
    /**
     * Assign or update roles for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsRolesCreate(id: number, requestBody: AdminRequest): CancelablePromise<Admin>;
    /**
     * Assign or update roles for an admin.
     * @param id A unique integer value identifying this admin.
     * @param requestBody
     * @returns Admin
     * @throws ApiError
     */
    static adminsRolesUpdate(id: number, requestBody: AdminRequest): CancelablePromise<Admin>;
}
