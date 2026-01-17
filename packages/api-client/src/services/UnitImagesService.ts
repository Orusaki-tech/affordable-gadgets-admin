/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InventoryUnitImage } from '../models/InventoryUnitImage';
import type { InventoryUnitImageRequest } from '../models/InventoryUnitImageRequest';
import type { PaginatedInventoryUnitImageList } from '../models/PaginatedInventoryUnitImageList';
import type { PatchedInventoryUnitImageRequest } from '../models/PatchedInventoryUnitImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static unitImagesList(
        page?: number,
    ): CancelablePromise<PaginatedInventoryUnitImageList> {
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
    public static unitImagesCreate(
        formData: InventoryUnitImageRequest,
    ): CancelablePromise<InventoryUnitImage> {
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
    public static unitImagesRetrieve(
        id: number,
    ): CancelablePromise<InventoryUnitImage> {
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
    public static unitImagesUpdate(
        id: number,
        formData: InventoryUnitImageRequest,
    ): CancelablePromise<InventoryUnitImage> {
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
    public static unitImagesPartialUpdate(
        id: number,
        formData?: PatchedInventoryUnitImageRequest,
    ): CancelablePromise<InventoryUnitImage> {
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
    public static unitImagesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/unit-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
