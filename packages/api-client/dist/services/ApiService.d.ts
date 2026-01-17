import type { AuthToken } from '../models/AuthToken';
import type { AuthTokenRequest } from '../models/AuthTokenRequest';
import type { Cart } from '../models/Cart';
import type { CartCreateRequest } from '../models/CartCreateRequest';
import type { CartRequest } from '../models/CartRequest';
import type { PaginatedCartList } from '../models/PaginatedCartList';
import type { PaginatedProductAccessoryList } from '../models/PaginatedProductAccessoryList';
import type { PaginatedPublicProductList } from '../models/PaginatedPublicProductList';
import type { PaginatedPublicPromotionList } from '../models/PaginatedPublicPromotionList';
import type { PaginatedReviewList } from '../models/PaginatedReviewList';
import type { PatchedCartRequest } from '../models/PatchedCartRequest';
import type { PatchedProductAccessoryRequest } from '../models/PatchedProductAccessoryRequest';
import type { PatchedReviewRequest } from '../models/PatchedReviewRequest';
import type { ProductAccessory } from '../models/ProductAccessory';
import type { ProductAccessoryRequest } from '../models/ProductAccessoryRequest';
import type { PublicProduct } from '../models/PublicProduct';
import type { PublicPromotion } from '../models/PublicPromotion';
import type { Review } from '../models/Review';
import type { ReviewRequest } from '../models/ReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ApiService {
    /**
     * Custom token login view that updates last_login field.
     * Use this instead of the default obtain_auth_token for admin users.
     * @param formData
     * @returns AuthToken
     * @throws ApiError
     */
    static apiAuthTokenLoginCreate(formData: AuthTokenRequest): CancelablePromise<AuthToken>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param accessory
     * @param mainProduct
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductAccessoryList
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkList(accessory?: number, mainProduct?: number, page?: number): CancelablePromise<PaginatedProductAccessoryList>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkCreate(requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkRetrieve(id: number): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkUpdate(id: number, requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkPartialUpdate(id: number, requestBody?: PatchedProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
     * @param id A unique integer value identifying this product accessory.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkDestroy(id: number): CancelablePromise<void>;
    /**
     * Cart management.
     * @param page A page number within the paginated result set.
     * @returns PaginatedCartList
     * @throws ApiError
     */
    static apiV1PublicCartList(page?: number): CancelablePromise<PaginatedCartList>;
    /**
     * Create or get existing cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartCreate(requestBody?: CartCreateRequest): CancelablePromise<Cart>;
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartRetrieve(id: number): CancelablePromise<Cart>;
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartUpdate(id: number, requestBody: CartRequest): CancelablePromise<Cart>;
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartPartialUpdate(id: number, requestBody?: PatchedCartRequest): CancelablePromise<Cart>;
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicCartDestroy(id: number): CancelablePromise<void>;
    /**
     * Checkout cart (convert to Lead).
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartCheckoutCreate(id: number, requestBody: CartRequest): CancelablePromise<Cart>;
    /**
     * Add item to cart.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartItemsCreate(id: number, requestBody: CartRequest): CancelablePromise<Cart>;
    /**
     * Remove one item from cart (reduce quantity by 1, or delete if quantity is 1).
     * @param id A unique integer value identifying this cart.
     * @param itemId
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicCartItemsDestroy(id: number, itemId: string): CancelablePromise<void>;
    /**
     * Check if customer is returning (by phone).
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartRecognizeRetrieve(): CancelablePromise<Cart>;
    /**
     * GET: Allows customers to search for available phone Products
     * within a specified budget range.
     * Returns Products (not individual units) with price ranges.
     *
     * Query Params required:
     * - min_price (required, decimal)
     * - max_price (required, decimal)
     *
     * Example URL: /api/v1/public/phone-search/?min_price=15000&max_price=30000
     * @param maxPrice
     * @param minPrice
     * @param page
     * @param pageSize
     * @returns PaginatedPublicProductList
     * @throws ApiError
     */
    static apiV1PublicPhoneSearchList(maxPrice?: number, minPrice?: number, page?: number, pageSize?: number): CancelablePromise<PaginatedPublicProductList>;
    /**
     * Override list to catch exceptions during queryset evaluation.
     * @param brandFilter
     * @param maxPrice
     * @param minPrice
     * @param ordering
     * @param page
     * @param pageSize
     * @param promotion
     * @param search
     * @param slug
     * @param type
     * @returns PaginatedPublicProductList
     * @throws ApiError
     */
    static apiV1PublicProductsList(brandFilter?: string, maxPrice?: number, minPrice?: number, ordering?: string, page?: number, pageSize?: number, promotion?: number, search?: string, slug?: string, type?: string): CancelablePromise<PaginatedPublicProductList>;
    /**
     * Public product browsing.
     * @param id A unique integer value identifying this product.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsRetrieve(id: number): CancelablePromise<PublicProduct>;
    /**
     * Get available units for a product with interest count.
     * @param id A unique integer value identifying this product.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsUnitsRetrieve(id: number): CancelablePromise<PublicProduct>;
    /**
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicPromotionList
     * @throws ApiError
     */
    static apiV1PublicPromotionsList(page?: number): CancelablePromise<PaginatedPublicPromotionList>;
    /**
     * @param id A unique integer value identifying this promotion.
     * @returns PublicPromotion
     * @throws ApiError
     */
    static apiV1PublicPromotionsRetrieve(id: number): CancelablePromise<PublicPromotion>;
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
    static apiV1PublicReviewsList(ordering?: string, page?: number, product?: number, search?: string): CancelablePromise<PaginatedReviewList>;
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
    static apiV1PublicReviewsCreate(formData: ReviewRequest): CancelablePromise<Review>;
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
    static apiV1PublicReviewsRetrieve(id: number): CancelablePromise<Review>;
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
    static apiV1PublicReviewsUpdate(id: number, formData: ReviewRequest): CancelablePromise<Review>;
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
    static apiV1PublicReviewsPartialUpdate(id: number, formData?: PatchedReviewRequest): CancelablePromise<Review>;
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
    static apiV1PublicReviewsDestroy(id: number): CancelablePromise<void>;
    /**
     * Bulk actions for reviews (approve, reject, delete, hide).
     * Content Creators can use this to moderate reviews.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsBulkActionCreate(formData: ReviewRequest): CancelablePromise<Review>;
}
