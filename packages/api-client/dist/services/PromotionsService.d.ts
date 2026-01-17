import type { PaginatedPromotionList } from '../models/PaginatedPromotionList';
import type { PatchedPromotionRequest } from '../models/PatchedPromotionRequest';
import type { Promotion } from '../models/Promotion';
import type { PromotionRequest } from '../models/PromotionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class PromotionsService {
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPromotionList
     * @throws ApiError
     */
    static promotionsList(page?: number): CancelablePromise<PaginatedPromotionList>;
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsCreate(formData: PromotionRequest): CancelablePromise<Promotion>;
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsRetrieve(id: number): CancelablePromise<Promotion>;
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsUpdate(id: number, formData: PromotionRequest): CancelablePromise<Promotion>;
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @param formData
     * @returns Promotion
     * @throws ApiError
     */
    static promotionsPartialUpdate(id: number, formData?: PatchedPromotionRequest): CancelablePromise<Promotion>;
    /**
     * Promotion management ViewSet (admin and marketing managers).
     * @param id A unique integer value identifying this promotion.
     * @returns void
     * @throws ApiError
     */
    static promotionsDestroy(id: number): CancelablePromise<void>;
}
