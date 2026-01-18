import type { Brand } from '../models/Brand';
import type { BrandRequest } from '../models/BrandRequest';
import type { PaginatedBrandList } from '../models/PaginatedBrandList';
import type { PatchedBrandRequest } from '../models/PatchedBrandRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class BrandsService {
    /**
     * Brand management ViewSet.
     * @param page A page number within the paginated result set.
     * @returns PaginatedBrandList
     * @throws ApiError
     */
    static brandsList(page?: number): CancelablePromise<PaginatedBrandList>;
    /**
     * Brand management ViewSet.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsCreate(requestBody: BrandRequest): CancelablePromise<Brand>;
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @returns Brand
     * @throws ApiError
     */
    static brandsRetrieve(id: number): CancelablePromise<Brand>;
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsUpdate(id: number, requestBody: BrandRequest): CancelablePromise<Brand>;
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @param requestBody
     * @returns Brand
     * @throws ApiError
     */
    static brandsPartialUpdate(id: number, requestBody?: PatchedBrandRequest): CancelablePromise<Brand>;
    /**
     * Brand management ViewSet.
     * @param id A unique integer value identifying this brand.
     * @returns void
     * @throws ApiError
     */
    static brandsDestroy(id: number): CancelablePromise<void>;
}
