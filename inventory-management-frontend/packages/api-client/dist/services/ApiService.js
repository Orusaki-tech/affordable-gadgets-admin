import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
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
    static apiAuthTokenLoginCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/token/login/',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param accessory
     * @param mainProduct
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductAccessoryList
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkList(accessory, mainProduct, page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/accessories-link/',
            query: {
                'accessory': accessory,
                'main_product': mainProduct,
                'page': page,
            },
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/accessories-link/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/accessories-link/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/public/accessories-link/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @param requestBody
     * @returns ProductAccessory
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public/accessories-link/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * ProductAccessoryViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this product accessory.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicAccessoriesLinkDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/accessories-link/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Public bundle ViewSet.
     * @param page
     * @param product
     * @returns PaginatedPublicBundleList
     * @throws ApiError
     */
    static apiV1PublicBundlesList(page, product) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/bundles/',
            query: {
                'page': page,
                'product': product,
            },
        });
    }
    /**
     * Public bundle ViewSet.
     * @param id A unique integer value identifying this bundle.
     * @returns PublicBundle
     * @throws ApiError
     */
    static apiV1PublicBundlesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/bundles/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Cart management.
     * @param page A page number within the paginated result set.
     * @returns PaginatedCartList
     * @throws ApiError
     */
    static apiV1PublicCartList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/cart/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Create or get existing cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/cart/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/cart/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/public/cart/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public/cart/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Cart management.
     * @param id A unique integer value identifying this cart.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicCartDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/cart/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Add a bundle to cart.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartBundlesCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/cart/{id}/bundles/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Checkout cart (convert to Lead).
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartCheckoutCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/cart/{id}/checkout/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Add item to cart.
     * @param id A unique integer value identifying this cart.
     * @param requestBody
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartItemsCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/cart/{id}/items/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove one item from cart (reduce quantity by 1, or delete if quantity is 1).
     * @param id A unique integer value identifying this cart.
     * @param itemId
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicCartItemsDestroy(id, itemId) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/cart/{id}/items/{item_id}/',
            path: {
                'id': id,
                'item_id': itemId,
            },
        });
    }
    /**
     * Check if customer is returning (by phone).
     * @param phone
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicCartRecognizeRetrieve(phone) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/cart/recognize/',
            query: {
                'phone': phone,
            },
        });
    }
    /**
     * Public delivery rates lookup.
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicDeliveryRateList
     * @throws ApiError
     */
    static apiV1PublicDeliveryRatesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/delivery-rates/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Public delivery rates lookup.
     * @param id A unique integer value identifying this delivery rate.
     * @returns PublicDeliveryRate
     * @throws ApiError
     */
    static apiV1PublicDeliveryRatesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/delivery-rates/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Create a BNPL inquiry which is routed to Leads (Sales team).
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicFinancingInquiryCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/financing/inquiry/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Return orders for a customer after OTP verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicOrdersHistoryCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/orders/history/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Send OTP for order history verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicOrdersOtpCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/orders/otp/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
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
    static apiV1PublicPhoneSearchList(maxPrice, minPrice, page, pageSize) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/phone-search/',
            query: {
                'max_price': maxPrice,
                'min_price': minPrice,
                'page': page,
                'page_size': pageSize,
            },
        });
    }
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
    static apiV1PublicProductsList(brandFilter, featured, homepageVideos, maxPrice, minPrice, ordering, page, pageSize, promotion, search, slug, type) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/',
            query: {
                'brand_filter': brandFilter,
                'featured': featured,
                'homepage_videos': homepageVideos,
                'max_price': maxPrice,
                'min_price': minPrice,
                'ordering': ordering,
                'page': page,
                'page_size': pageSize,
                'promotion': promotion,
                'search': search,
                'slug': slug,
                'type': type,
            },
        });
    }
    /**
     * Cache public product detail responses.
     * @param id A unique integer value identifying this product.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/{id}/',
            path: {
                'id': id,
            },
        });
    }
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
    static apiV1PublicProductsUnitsList(id, ordering, page, pageSize, search) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/{id}/units/',
            path: {
                'id': id,
            },
            query: {
                'ordering': ordering,
                'page': page,
                'page_size': pageSize,
                'search': search,
            },
        });
    }
    /**
     * Return distinct brand names grouped by product type for menu use.
     * Uses a minimal queryset (values_list) to avoid N+1 and heavy get_queryset pipeline.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsBrandsRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/brands/',
        });
    }
    /**
     * Published buying guide for a product (404 if missing or draft).
     * @param productSlug
     * @returns PublicProductArticle
     * @throws ApiError
     */
    static apiV1PublicProductsBySlugArticleRetrieve(productSlug) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/by-slug/{product_slug}/article/',
            path: {
                'product_slug': productSlug,
            },
        });
    }
    /**
     * Return review summary (count + average) for a list of product IDs.
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsReviewSummaryRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/review-summary/',
        });
    }
    /**
     * Skip DRF authentication for public endpoints so invalid/missing tokens don't cause 401.
     * Use with permission_classes = [AllowAny] so unauthenticated clients can access the API.
     * @param displayLocation
     * @param page
     * @param pageSize
     * @returns PaginatedPublicPromotionList
     * @throws ApiError
     */
    static apiV1PublicPromotionsList(displayLocation, page, pageSize) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/promotions/',
            query: {
                'display_location': displayLocation,
                'page': page,
                'page_size': pageSize,
            },
        });
    }
    /**
     * Skip DRF authentication for public endpoints so invalid/missing tokens don't cause 401.
     * Use with permission_classes = [AllowAny] so unauthenticated clients can access the API.
     * @param id A unique integer value identifying this promotion.
     * @returns PublicPromotion
     * @throws ApiError
     */
    static apiV1PublicPromotionsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/promotions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param product
     * @param search A search term.
     * @returns PaginatedReviewList
     * @throws ApiError
     */
    static apiV1PublicReviewsList(ordering, page, product, search) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/reviews/',
            query: {
                'ordering': ordering,
                'page': page,
                'product': product,
                'search': search,
            },
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/reviews/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/public/reviews/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/public/reviews/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * ReviewViewSet for public API: no auth so unauthenticated clients get 200, not 401.
     * @param id A unique integer value identifying this review.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicReviewsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/reviews/{id}/',
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
    static apiV1PublicReviewsBulkActionCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/bulk_action/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Return eligible purchased items for review.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicReviewsEligibilityCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/eligibility/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Send OTP for review verification.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static apiV1PublicReviewsOtpCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/otp/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Create a verified review after OTP verification.
     * @param formData
     * @returns Review
     * @throws ApiError
     */
    static apiV1PublicReviewsSubmitCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/submit/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Override to cache GET response and avoid repeated heavy serialization.
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicWishlistItemList
     * @throws ApiError
     */
    static apiV1PublicWishlistList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/wishlist/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Public wishlist API (session or customer-phone based).
     * @param requestBody
     * @returns PublicWishlistItem
     * @throws ApiError
     */
    static apiV1PublicWishlistCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/wishlist/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Public wishlist API (session or customer-phone based).
     * @param id A unique integer value identifying this wishlist item.
     * @returns PublicWishlistItem
     * @throws ApiError
     */
    static apiV1PublicWishlistRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/wishlist/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Public wishlist API (session or customer-phone based).
     * @param id A unique integer value identifying this wishlist item.
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicWishlistDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/wishlist/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Public wishlist API (session or customer-phone based).
     * @returns void
     * @throws ApiError
     */
    static apiV1PublicWishlistByProductDestroy() {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/public/wishlist/by-product/',
        });
    }
}
