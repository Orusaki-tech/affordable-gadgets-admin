import type { AdminRole } from '../models/AdminRole';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AdminRolesService {
    /**
     * ViewSet for listing available admin roles.
     * Read-only access to see what roles can be assigned.
     * @returns AdminRole
     * @throws ApiError
     */
    static adminRolesList(): CancelablePromise<Array<AdminRole>>;
    /**
     * ViewSet for listing available admin roles.
     * Read-only access to see what roles can be assigned.
     * @param id A unique integer value identifying this Admin Role.
     * @returns AdminRole
     * @throws ApiError
     */
    static adminRolesRetrieve(id: number): CancelablePromise<AdminRole>;
}
