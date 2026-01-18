import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UnitImagesService {
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedInventoryUnitImageList
     * @throws ApiError
     */
    static unitImagesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/unit-images/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param formData
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/unit-images/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @returns InventoryUnitImage
     * @throws ApiError
     */
    static unitImagesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/unit-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
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
    static unitImagesUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/unit-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
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
    static unitImagesPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/unit-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for individual inventory unit images.
     * Only Admins can add/manage images; everyone can view unit images
     * (which are nested in InventoryUnitViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this inventory unit image.
     * @returns void
     * @throws ApiError
     */
    static unitImagesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/unit-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
