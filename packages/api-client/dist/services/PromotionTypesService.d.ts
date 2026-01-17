import type { PaginatedPromotionTypeList } from '../models/PaginatedPromotionTypeList';
import type { PatchedPromotionTypeRequest } from '../models/PatchedPromotionTypeRequest';
import type { PromotionType } from '../models/PromotionType';
import type { PromotionTypeRequest } from '../models/PromotionTypeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class PromotionTypesService {
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionTypeList
     * @throws ApiError
     */
    static promotionTypesList(page?: number): CancelablePromise<PaginatedPromotionTypeList>;
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesCreate(requestBody: PromotionTypeRequest): CancelablePromise<PromotionType>;
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesRetrieve(id: number): CancelablePromise<PromotionType>;
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesUpdate(id: number, requestBody: PromotionTypeRequest): CancelablePromise<PromotionType>;
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @param requestBody
     * @returns PromotionType
     * @throws ApiError
     */
    static promotionTypesPartialUpdate(id: number, requestBody?: PatchedPromotionTypeRequest): CancelablePromise<PromotionType>;
    /**
     * PromotionType management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this Promotion Type.
     * @returns void
     * @throws ApiError
     */
    static promotionTypesDestroy(id: number): CancelablePromise<void>;
}
