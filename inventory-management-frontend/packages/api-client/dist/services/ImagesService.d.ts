import type { PaginatedProductImageList } from '../models/PaginatedProductImageList';
import type { PatchedProductImageRequest } from '../models/PatchedProductImageRequest';
import type { ProductImage } from '../models/ProductImage';
import type { ProductImageRequest } from '../models/ProductImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ImagesService {
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductImageList
     * @throws ApiError
     */
    static imagesList(page?: number): CancelablePromise<PaginatedProductImageList>;
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesCreate(formData: ProductImageRequest): CancelablePromise<ProductImage>;
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesRetrieve(id: number): CancelablePromise<ProductImage>;
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesUpdate(id: number, formData: ProductImageRequest): CancelablePromise<ProductImage>;
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesPartialUpdate(id: number, formData?: PatchedProductImageRequest): CancelablePromise<ProductImage>;
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns void
     * @throws ApiError
     */
    static imagesDestroy(id: number): CancelablePromise<void>;
}
