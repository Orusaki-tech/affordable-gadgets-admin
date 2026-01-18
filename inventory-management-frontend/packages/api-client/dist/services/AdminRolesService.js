import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminRolesService {
    /**
     * ViewSet for listing available admin roles.
     * Read-only access to see what roles can be assigned.
     * @returns AdminRole
     * @throws ApiError
     */
    static adminRolesList() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin-roles/',
        });
    }
    /**
     * ViewSet for listing available admin roles.
     * Read-only access to see what roles can be assigned.
     * @param id A unique integer value identifying this Admin Role.
     * @returns AdminRole
     * @throws ApiError
     */
    static adminRolesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin-roles/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
