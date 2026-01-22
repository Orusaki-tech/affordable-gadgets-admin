/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedProductImageList } from '../models/PaginatedProductImageList';
import type { PatchedProductImageRequest } from '../models/PatchedProductImageRequest';
import type { ProductImage } from '../models/ProductImage';
import type { ProductImageRequest } from '../models/ProductImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImagesService {
    /**
     * CRUD for individual product images.
     * Only Admins can add/manage images; everyone can view product images
     * (which are nested in ProductViewSet).
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductImageList
     * @throws ApiError
     */
    public static imagesList(
        page?: number,
    ): CancelablePromise<PaginatedProductImageList> {
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
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    public static imagesCreate(
        formData: ProductImageRequest,
    ): CancelablePromise<ProductImage> {
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
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns ProductImage
     * @throws ApiError
     */
    public static imagesRetrieve(
        id: number,
    ): CancelablePromise<ProductImage> {
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
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    public static imagesUpdate(
        id: number,
        formData: ProductImageRequest,
    ): CancelablePromise<ProductImage> {
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
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @param formData
     * @returns ProductImage
     * @throws ApiError
     */
    public static imagesPartialUpdate(
        id: number,
        formData?: PatchedProductImageRequest,
    ): CancelablePromise<ProductImage> {
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
     * Uses IsContentCreatorOrInventoryManagerOrReadOnly.
     * @param id A unique integer value identifying this product image.
     * @returns void
     * @throws ApiError
     */
    public static imagesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/images/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
