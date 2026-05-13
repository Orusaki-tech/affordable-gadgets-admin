import type { AdminAuthToken } from '../models/AdminAuthToken';
import type { AdminAuthTokenRequest } from '../models/AdminAuthTokenRequest';
import type { Cart } from '../models/Cart';
import type { CartCreateRequest } from '../models/CartCreateRequest';
import type { CartRequest } from '../models/CartRequest';
import type { FinancingInquiryRequestRequest } from '../models/FinancingInquiryRequestRequest';
import type { OrderHistoryRequestRequest } from '../models/OrderHistoryRequestRequest';
import type { OrderOtpRequestRequest } from '../models/OrderOtpRequestRequest';
import type { PaginatedCartList } from '../models/PaginatedCartList';
import type { PaginatedProductAccessoryList } from '../models/PaginatedProductAccessoryList';
import type { PaginatedPublicBundleList } from '../models/PaginatedPublicBundleList';
import type { PaginatedPublicDeliveryRateList } from '../models/PaginatedPublicDeliveryRateList';
import type { PaginatedPublicInventoryUnitPublicList } from '../models/PaginatedPublicInventoryUnitPublicList';
import type { PaginatedPublicProductList } from '../models/PaginatedPublicProductList';
import type { PaginatedPublicProductListList } from '../models/PaginatedPublicProductListList';
import type { PaginatedPublicPromotionList } from '../models/PaginatedPublicPromotionList';
import type { PaginatedPublicWishlistItemList } from '../models/PaginatedPublicWishlistItemList';
import type { PaginatedReviewList } from '../models/PaginatedReviewList';
import type { PatchedCartRequest } from '../models/PatchedCartRequest';
import type { PatchedProductAccessoryRequest } from '../models/PatchedProductAccessoryRequest';
import type { PatchedReviewRequest } from '../models/PatchedReviewRequest';
import type { ProductAccessory } from '../models/ProductAccessory';
import type { ProductAccessoryRequest } from '../models/ProductAccessoryRequest';
import type { PublicBundle } from '../models/PublicBundle';
import type { PublicDeliveryRate } from '../models/PublicDeliveryRate';
import type { PublicProduct } from '../models/PublicProduct';
import type { PublicProductArticle } from '../models/PublicProductArticle';
import type { PublicPromotion } from '../models/PublicPromotion';
import type { PublicReviewSubmitRequest } from '../models/PublicReviewSubmitRequest';
import type { PublicWishlistItem } from '../models/PublicWishlistItem';
import type { PublicWishlistItemRequest } from '../models/PublicWishlistItemRequest';
import type { Review } from '../models/Review';
import type { ReviewEligibilityRequestRequest } from '../models/ReviewEligibilityRequestRequest';
import type { ReviewOtpRequestRequest } from '../models/ReviewOtpRequestRequest';
import type { ReviewRequest } from '../models/ReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ApiService {
    /**
     * Custom token login view that updates last_login field.
     * Use this instead of the default obtain_auth_token for admin users.
     *
     * Supports both username and email login (username field can contain an email).
     * Only allows users with is_staff=True or is_superuser=True to login.
     * @param formData
     * @returns AdminAuthToken
     * @throws ApiError
     */
    static apiAuthTokenLoginCreate(formData: AdminAuthTokenRequest): CancelablePromise<AdminAuthToken>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param accessory
     * @param mainProduct
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductAccessoryList
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkList(accessory?: number, mainProduct?: number, page?: number): CancelablePromise<PaginatedProductAccessoryList>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkCreate(requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkRetrieve(id: number): CancelablePromise<ProductAccessory>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkUpdate(id: number, requestBody: ProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkPartialUpdate(id: number, requestBody?: PatchedProductAccessoryRequest): CancelablePromise<ProductAccessory>;
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkDestroy(id: number): CancelablePromise<void>;
    /**
     * Public bundle ViewSet.
     * @param page
     * @param product
     * @returns PaginatedPublicBundleList
     * @throws ApiError
     */
    static apiV1PublicBundlesList(page?: number, product?: number): CancelablePromise<PaginatedPublicBundleList>;
    /**
     * Public bundle ViewSet.
     * @param id A unique integer value identifying this bundle.
     * @returns PublicBundle
     * @throws ApiError
     */
    static apiV1PublicBundlesRetrieve(id: number): CancelablePromise<PublicBundle>;
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
     * Add a bundle to cart.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartBundlesCreate(id: number, requestBody: CartRequest): CancelablePromise<Cart>;
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
     * @param phone
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicCartRecognizeRetrieve(phone: string): CancelablePromise<Record<string, any>>;
    /**
     * Public delivery rates lookup.
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicDeliveryRateList
     * @throws ApiError
     */
    static apiV1PublicDeliveryRatesList(page?: number): CancelablePromise<PaginatedPublicDeliveryRateList>;
    /**
     * Public delivery rates lookup.
     * @param id A unique integer value identifying this delivery rate.
     * @returns PublicDeliveryRate
     * @throws ApiError
     */
    static apiV1PublicDeliveryRatesRetrieve(id: number): CancelablePromise<PublicDeliveryRate>;
    /**
     * Create a BNPL inquiry which is routed to Leads (Sales team).
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicFinancingInquiryCreate(requestBody: FinancingInquiryRequestRequest): CancelablePromise<Record<string, any>>;
    /**
     * Return orders for a customer after OTP verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicOrdersHistoryCreate(requestBody: OrderHistoryRequestRequest): CancelablePromise<Record<string, any>>;
    /**
     * Send OTP for order history verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicOrdersOtpCreate(requestBody: OrderOtpRequestRequest): CancelablePromise<Record<string, any>>;
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
     * @param featured If true, return only products tagged as "Featured" (for homepage; use page_size=5 for fast load).
     * @param homepageVideos If true, return only published products tagged "Video" with a product video URL or uploaded video file (homepage reel).
     * @param maxPrice
     * @param minPrice
     * @param ordering
     * @param page
     * @param pageSize
     * @param promotion
     * @param search
     * @param slug
     * @param type
     * @returns PaginatedPublicProductListList
     * @throws ApiError
     */
    static apiV1PublicProductsList(brandFilter?: string, featured?: boolean, homepageVideos?: boolean, maxPrice?: number, minPrice?: number, ordering?: string, page?: number, pageSize?: number, promotion?: number, search?: string, slug?: string, type?: string): CancelablePromise<PaginatedPublicProductListList>;
    /**
     * Cache public product detail responses.
     * @param id A unique integer value identifying this product.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsRetrieve(id: number): CancelablePromise<PublicProduct>;
    /**
     * Get available units for a product with interest count.
     * @param id A unique integer value identifying this product.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param pageSize Number of results to return per page.
     * @param search A search term.
     * @returns PaginatedPublicInventoryUnitPublicList
     * @throws ApiError
     */
    static apiV1PublicProductsUnitsList(id: number, ordering?: string, page?: number, pageSize?: number, search?: string): CancelablePromise<PaginatedPublicInventoryUnitPublicList>;
    /**
     * Return distinct brand names grouped by product type for menu use.
     * Uses a minimal queryset (values_list) to avoid N+1 and heavy get_queryset pipeline.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsBrandsRetrieve(): CancelablePromise<PublicProduct>;
    /**
     * Published buying guide for a product (404 if missing or draft).
     * @param productSlug
     * @returns PublicProductArticle
     * @throws ApiError
     */
    static apiV1PublicProductsBySlugArticleRetrieve(productSlug: string): CancelablePromise<PublicProductArticle>;
    /**
     * Return review summary (count + average) for a list of product IDs.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsReviewSummaryRetrieve(): CancelablePromise<PublicProduct>;
    /**
     * Skip DRF authentication for public endpoints so invalid/missing tokens don't cause 401.
     * Use with permission_classes = [AllowAny] so unauthenticated clients can access the API.
     * @param displayLocation
     * @param page
     * @param pageSize
     * @returns PaginatedPublicPromotionList
     * @throws ApiError
     */
    static apiV1PublicPromotionsList(displayLocation?: string, page?: number, pageSize?: number): CancelablePromise<PaginatedPublicPromotionList>;
    /**
     * Skip DRF authentication for public endpoints so invalid/missing tokens don't cause 401.
     * Use with permission_classes = [AllowAny] so unauthenticated clients can access the API.
     * @param id A unique integer value identifying this promotion.
     * @returns PublicPromotion
     * @throws ApiError
     */
    static apiV1PublicPromotionsRetrieve(id: number): CancelablePromise<PublicPromotion>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param search A search term.
     * @returns PaginatedReviewList
     * @throws ApiError
     */
    static apiV1PublicReviewsList(ordering?: string, page?: number, product?: number, search?: string): CancelablePromise<PaginatedReviewList>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsCreate(formData: ReviewRequest): CancelablePromise<Review>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsRetrieve(id: number): CancelablePromise<Review>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsUpdate(id: number, formData: ReviewRequest): CancelablePromise<Review>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsPartialUpdate(id: number, formData?: PatchedReviewRequest): CancelablePromise<Review>;
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
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
    /**
     * Return eligible purchased items for review.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicReviewsEligibilityCreate(requestBody: ReviewEligibilityRequestRequest): CancelablePromise<Record<string, any>>;
    /**
     * Send OTP for review verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicReviewsOtpCreate(requestBody: ReviewOtpRequestRequest): CancelablePromise<Record<string, any>>;
    /**
     * Create a verified review after OTP verification.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsSubmitCreate(formData: PublicReviewSubmitRequest): CancelablePromise<Review>;
    /**
     * Override to cache GET response and avoid repeated heavy serialization.
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicWishlistItemList
     * @throws ApiError
     */
    static apiV1PublicWishlistList(page?: number): CancelablePromise<PaginatedPublicWishlistItemList>;
    /**
     * Public wishlist API (session or customer-phone based).
     * @param requestBody
     * @returns PublicWishlistItem
     * @throws ApiError
     */
    static apiV1PublicWishlistCreate(requestBody: PublicWishlistItemRequest): CancelablePromise<PublicWishlistItem>;
    /**
     * Public wishlist API (session or customer-phone based).
     * @param id A unique integer value identifying this wishlist item.
     * @returns PublicWishlistItem
     * @throws ApiError
     */
    static apiV1PublicWishlistRetrieve(id: number): CancelablePromise<PublicWishlistItem>;
    /**
     * Public wishlist API (session or customer-phone based).
     * @param id A unique integer value identifying this wishlist item.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicWishlistDestroy(id: number): CancelablePromise<void>;
    /**
     * Public wishlist API (session or customer-phone based).
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicWishlistByProductDestroy(): CancelablePromise<void>;
}
