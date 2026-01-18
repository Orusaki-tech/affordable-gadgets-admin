import type { PaginatedReviewList } from '../models/PaginatedReviewList';
import type { PatchedReviewRequest } from '../models/PatchedReviewRequest';
import type { Review } from '../models/Review';
import type { ReviewRequest } from '../models/ReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReviewsService {
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
    static reviewsList(ordering?: string, page?: number, product?: number, search?: string): CancelablePromise<PaginatedReviewList>;
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
    static reviewsCreate(formData: ReviewRequest): CancelablePromise<Review>;
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
    static reviewsRetrieve(id: number): CancelablePromise<Review>;
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
    static reviewsUpdate(id: number, formData: ReviewRequest): CancelablePromise<Review>;
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
    static reviewsPartialUpdate(id: number, formData?: PatchedReviewRequest): CancelablePromise<Review>;
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
    static reviewsDestroy(id: number): CancelablePromise<void>;
    /**
     * Bulk actions for reviews (approve, reject, delete, hide).
     * Content Creators can use this to moderate reviews.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static reviewsBulkActionCreate(formData: ReviewRequest): CancelablePromise<Review>;
}
