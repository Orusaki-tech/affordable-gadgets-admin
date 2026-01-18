import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImagesService {
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductImageList
     * @throws ApiError
     */
    static imagesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/images/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/images/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/images/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    static imagesPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns void
     * @throws ApiError
     */
    static imagesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/images/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
