import type { InventoryUnitImage } from '../models/InventoryUnitImage';
import type { InventoryUnitImageRequest } from '../models/InventoryUnitImageRequest';
import type { PaginatedInventoryUnitImageList } from '../models/PaginatedInventoryUnitImageList';
import type { PatchedInventoryUnitImageRequest } from '../models/PatchedInventoryUnitImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class UnitImagesService {
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedInventoryUnitImageList
     * @throws ApiError
     */
    static unitImagesList(page?: number): CancelablePromise<PaginatedInventoryUnitImageList>;
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param formData
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesCreate(formData: InventoryUnitImageRequest): CancelablePromise<InventoryUnitImage>;
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesRetrieve(id: number): CancelablePromise<InventoryUnitImage>;
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @param formData
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesUpdate(id: number, formData: InventoryUnitImageRequest): CancelablePromise<InventoryUnitImage>;
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @param formData
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesPartialUpdate(id: number, formData?: PatchedInventoryUnitImageRequest): CancelablePromise<InventoryUnitImage>;
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @returns void
     * @throws ApiError
     */
    static unitImagesDestroy(id: number): CancelablePromise<void>;
}
