/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedProductArticleList } from '../models/PaginatedProductArticleList';
import type { PatchedProductArticleRequest } from '../models/PatchedProductArticleRequest';
import type { ProductArticle } from '../models/ProductArticle';
import type { ProductArticleRequest } from '../models/ProductArticleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArticlesService {
    /**
     * CRUD for product buying guides / blog articles.
     * @param category * `buying_guide` - Buying Guide
     * * `history_guide` - History Guide
     * * `informational_guide` - Informational Guide
     * * `tech_tip` - Tech Tip
     * * `news` - News
     * * `general` - General
     * @param isPublished
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param search A search term.
     * @returns PaginatedProductArticleList
     * @throws ApiError
     */
    public static articlesList(
        category?: 'buying_guide' | 'general' | 'history_guide' | 'informational_guide' | 'news' | 'tech_tip',
        isPublished?: boolean,
        ordering?: string,
        page?: number,
        product?: number,
        search?: string,
    ): CancelablePromise<PaginatedProductArticleList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/articles/',
            query: {
                'category': category,
                'is_published': isPublished,
                'ordering': ordering,
                'page': page,
                'product': product,
                'search': search,
            },
        });
    }
    /**
     * CRUD for product buying guides / blog articles.
     * @param formData
     * @returns ProductArticle
     * @throws ApiError
     */
    public static articlesCreate(
        formData: ProductArticleRequest,
    ): CancelablePromise<ProductArticle> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/articles/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for product buying guides / blog articles.
     * @param id A unique integer value identifying this product article.
     * @returns ProductArticle
     * @throws ApiError
     */
    public static articlesRetrieve(
        id: number,
    ): CancelablePromise<ProductArticle> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/articles/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for product buying guides / blog articles.
     * @param id A unique integer value identifying this product article.
     * @param formData
     * @returns ProductArticle
     * @throws ApiError
     */
    public static articlesUpdate(
        id: number,
        formData: ProductArticleRequest,
    ): CancelablePromise<ProductArticle> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/articles/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for product buying guides / blog articles.
     * @param id A unique integer value identifying this product article.
     * @param formData
     * @returns ProductArticle
     * @throws ApiError
     */
    public static articlesPartialUpdate(
        id: number,
        formData?: PatchedProductArticleRequest,
    ): CancelablePromise<ProductArticle> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/articles/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for product buying guides / blog articles.
     * @param id A unique integer value identifying this product article.
     * @returns void
     * @throws ApiError
     */
    public static articlesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/articles/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
