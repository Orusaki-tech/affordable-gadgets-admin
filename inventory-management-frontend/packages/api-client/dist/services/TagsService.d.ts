import type { PatchedTagRequest } from '../models/PatchedTagRequest';
import type { Tag } from '../models/Tag';
import type { TagRequest } from '../models/TagRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class TagsService {
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @returns Tag
     * @throws ApiError
     */
    static tagsList(): CancelablePromise<Array<Tag>>;
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    static tagsCreate(requestBody: TagRequest): CancelablePromise<Tag>;
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @returns Tag
     * @throws ApiError
     */
    static tagsRetrieve(id: number): CancelablePromise<Tag>;
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    static tagsUpdate(id: number, requestBody: TagRequest): CancelablePromise<Tag>;
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @param requestBody
     * @returns Tag
     * @throws ApiError
     */
    static tagsPartialUpdate(id: number, requestBody?: PatchedTagRequest): CancelablePromise<Tag>;
    /**
     * ViewSet for managing product tags.
     * - All authenticated staff users can read
     * - Content Creators and Inventory Managers can create/edit/delete
     * @param id A unique integer value identifying this tag.
     * @returns void
     * @throws ApiError
     */
    static tagsDestroy(id: number): CancelablePromise<void>;
}
