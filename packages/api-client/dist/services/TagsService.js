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
    static tagsList() {
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
    static tagsCreate(requestBody) {
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
    static tagsRetrieve(id) {
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
    static tagsUpdate(id, requestBody) {
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
    static tagsPartialUpdate(id, requestBody) {
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
    static tagsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/tags/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
