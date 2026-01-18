import type { PaginatedProductAccessoryList } from '../models/PaginatedProductAccessoryList';
import type { PatchedProductAccessoryRequest } from '../models/PatchedProductAccessoryRequest';
import type { ProductAccessory } from '../models/ProductAccessory';
import type { ProductAccessoryRequest } from '../models/ProductAccessoryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AccessoriesLinkService {
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param accessory
     * @param mainProduct
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductAccessoryList
     * @throws ApiError
     */
    static accessoriesLinkList(accessory?: number, mainProduct?: number, page?: number): CancelablePromise<PaginatedProductAccessoryList>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static accessoriesLinkCreate(requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns ProductAccessory
     * @throws ApiError
     */
    static accessoriesLinkRetrieve(id: number): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static accessoriesLinkUpdate(id: number, requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static accessoriesLinkPartialUpdate(id: number, requestBody?: PatchedProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns void
     * @throws ApiError
     */
    static accessoriesLinkDestroy(id: number): CancelablePromise<void>;
}
