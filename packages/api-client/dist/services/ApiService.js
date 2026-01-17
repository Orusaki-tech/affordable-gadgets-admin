import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * Custom token login view that updates last_login field.
     * Use this instead of the default obtain_auth_token for admin users.
     * @param formData
     * @returns AuthToken
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * Link model between products and accessories. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * Allows all product types to have accessories (including accessories having accessories).
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
     * @returns Cart
     * @throws ApiError
     */
    static apiV1PublicCartRecognizeRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/cart/recognize/',
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
    static apiV1PublicProductsList(brandFilter, maxPrice, minPrice, ordering, page, pageSize, promotion, search, slug, type) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/',
            query: {
                'brand_filter': brandFilter,
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
     * Public product browsing.
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
     * @returns PublicProduct
     * @throws ApiError
     */
    static apiV1PublicProductsUnitsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/{id}/units/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicPromotionList
     * @throws ApiError
     */
    static apiV1PublicPromotionsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/promotions/',
            query: {
                'page': page,
            },
        });
    }
    /**
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
    static apiV1PublicReviewsCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/',
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
}
