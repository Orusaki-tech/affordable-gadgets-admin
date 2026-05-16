/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArticleImage } from '../models/ArticleImage';
import type { ArticleImageRequest } from '../models/ArticleImageRequest';
import type { PaginatedArticleImageList } from '../models/PaginatedArticleImageList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArticleImagesService {
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
    public static articleImagesPartialUpdate(
        id: number,
        formData?: ArticleImageRequest,
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
}
