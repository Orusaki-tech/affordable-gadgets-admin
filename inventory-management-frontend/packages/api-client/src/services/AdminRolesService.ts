/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminRole } from '../models/AdminRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminRolesService {
    /**
     * ViewSet for listing available admin roles.
     * Read-only access to see what roles can be assigned.
     * @returns AdminRole
     * @throws ApiError
     */
    public static adminRolesList(): CancelablePromise<Array<AdminRole>> {
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
    public static adminRolesRetrieve(
        id: number,
    ): CancelablePromise<AdminRole> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin-roles/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
