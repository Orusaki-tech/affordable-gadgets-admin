import type { Color } from '../models/Color';
import type { ColorRequest } from '../models/ColorRequest';
import type { PaginatedColorList } from '../models/PaginatedColorList';
import type { PatchedColorRequest } from '../models/PatchedColorRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ColorsService {
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedColorList
     * @throws ApiError
     */
    static colorsList(page?: number): CancelablePromise<PaginatedColorList>;
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsCreate(requestBody: ColorRequest): CancelablePromise<Color>;
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns Color
     * @throws ApiError
     */
    static colorsRetrieve(id: number): CancelablePromise<Color>;
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsUpdate(id: number, requestBody: ColorRequest): CancelablePromise<Color>;
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    static colorsPartialUpdate(id: number, requestBody?: PatchedColorRequest): CancelablePromise<Color>;
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns void
     * @throws ApiError
     */
    static colorsDestroy(id: number): CancelablePromise<void>;
}
