/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatchedTagRequest } from '../models/PatchedTagRequest';
import type { Tag } from '../models/Tag';
import type { TagRequest } from '../models/TagRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TagsService {
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @returns Tag
     * @throws ApiError
     */
    public static tagsList(): CancelablePromise<Array<Tag>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tags/',
        });
    }
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    public static tagsCreate(
        requestBody: TagRequest,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tags/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @returns Tag
     * @throws ApiError
     */
    public static tagsRetrieve(
        id: number,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tags/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    public static tagsUpdate(
        id: number,
        requestBody: TagRequest,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/tags/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    public static tagsPartialUpdate(
        id: number,
        requestBody?: PatchedTagRequest,
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/tags/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @returns void
     * @throws ApiError
     */
    public static tagsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/tags/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
