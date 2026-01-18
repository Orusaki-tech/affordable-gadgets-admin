/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedReviewList } from '../models/PaginatedReviewList';
import type { PatchedReviewRequest } from '../models/PatchedReviewRequest';
import type { Review } from '../models/Review';
import type { ReviewRequest } from '../models/ReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReviewsService {
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param search A search term.
     * @returns PaginatedReviewList
     * @throws ApiError
     */
    public static reviewsList(
        ordering?: string,
        page?: number,
        product?: number,
        search?: string,
    ): CancelablePromise<PaginatedReviewList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reviews/',
            query: {
                'ordering': ordering,
                'page': page,
                'product': product,
                'search': search,
            },
        });
    }
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    public static reviewsCreate(
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reviews/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param id A unique integer value identifying this review.
     * @returns Review
     * @throws ApiError
     */
    public static reviewsRetrieve(
        id: number,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    public static reviewsUpdate(
        id: number,
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/reviews/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    public static reviewsPartialUpdate(
        id: number,
        formData?: PatchedReviewRequest,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/reviews/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Handles customer and admin reviews.
     * - Everyone can read (GET).
     * - Authenticated users can create (POST).
     * - Owners or Admins can update/delete (PUT/PATCH/DELETE).
     * - Uses IsReviewOwnerOrAdmin.
     * - Supports video file uploads via multipart/form-data.
     * @param id A unique integer value identifying this review.
     * @returns void
     * @throws ApiError
     */
    public static reviewsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/reviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Bulk actions for reviews (approve, reject, delete, hide).
     * Content Creators can use this to moderate reviews.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    public static reviewsBulkActionCreate(
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reviews/bulk_action/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
