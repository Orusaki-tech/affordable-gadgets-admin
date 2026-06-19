/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArticleImage } from '../models/ArticleImage';
import type { ArticleImageRequest } from '../models/ArticleImageRequest';
import type { ArticleImageUpload } from '../models/ArticleImageUpload';
import type { ArticleImageUploadRequest } from '../models/ArticleImageUploadRequest';
import type { PaginatedArticleImageList } from '../models/PaginatedArticleImageList';
import type { PatchedArticleImageRequest } from '../models/PatchedArticleImageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArticleImagesService {
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param page A page number within the paginated result set.
     * @returns PaginatedArticleImageList
     * @throws ApiError
     */
    public static articleImagesList(
        page?: number,
    ): CancelablePromise<PaginatedArticleImageList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/article-images/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    public static articleImagesCreate(
        formData: ArticleImageRequest,
    ): CancelablePromise<ArticleImage> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/article-images/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns ArticleImage
     * @throws ApiError
     */
    public static articleImagesRetrieve(
        id: number,
    ): CancelablePromise<ArticleImage> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    public static articleImagesUpdate(
        id: number,
        formData: ArticleImageRequest,
    ): CancelablePromise<ArticleImage> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @param formData
     * @returns ArticleImage
     * @throws ApiError
     */
    public static articleImagesPartialUpdate(
        id: number,
        formData?: PatchedArticleImageRequest,
    ): CancelablePromise<ArticleImage> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for images embedded within a product buying guide / article body.
     * Only Content Creators and Inventory Managers can add/manage images.
     * @param id A unique integer value identifying this article image.
     * @returns void
     * @throws ApiError
     */
    public static articleImagesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/article-images/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Upload an image for embedding in a buying guide / article body.
     * Returns the Cloudinary URL. Does NOT create a persistent ArticleImage record.
     * @param formData
     * @returns ArticleImageUpload
     * @throws ApiError
     */
    public static articleImagesUploadCreate(
        formData: ArticleImageUploadRequest,
    ): CancelablePromise<ArticleImageUpload> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/article-images/upload/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
