/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminAuthToken } from '../models/AdminAuthToken';
import type { AdminAuthTokenRequest } from '../models/AdminAuthTokenRequest';
import type { Cart } from '../models/Cart';
import type { CartCreateRequest } from '../models/CartCreateRequest';
import type { CartRequest } from '../models/CartRequest';
import type { PaginatedCartList } from '../models/PaginatedCartList';
import type { PaginatedProductAccessoryList } from '../models/PaginatedProductAccessoryList';
import type { PaginatedPublicBundleList } from '../models/PaginatedPublicBundleList';
import type { PaginatedPublicInventoryUnitPublicList } from '../models/PaginatedPublicInventoryUnitPublicList';
import type { PaginatedPublicProductList } from '../models/PaginatedPublicProductList';
import type { PaginatedPublicProductListList } from '../models/PaginatedPublicProductListList';
import type { PaginatedPublicPromotionList } from '../models/PaginatedPublicPromotionList';
import type { PaginatedReviewList } from '../models/PaginatedReviewList';
import type { PatchedCartRequest } from '../models/PatchedCartRequest';
import type { PatchedProductAccessoryRequest } from '../models/PatchedProductAccessoryRequest';
import type { PatchedReviewRequest } from '../models/PatchedReviewRequest';
import type { ProductAccessory } from '../models/ProductAccessory';
import type { ProductAccessoryRequest } from '../models/ProductAccessoryRequest';
import type { PublicBundle } from '../models/PublicBundle';
import type { PublicProduct } from '../models/PublicProduct';
import type { PublicPromotion } from '../models/PublicPromotion';
import type { Review } from '../models/Review';
import type { ReviewRequest } from '../models/ReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static apiAuthTokenLoginCreate(
        formData: AdminAuthTokenRequest,
    ): CancelablePromise<AdminAuthToken> {
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
    public static apiV1PublicAccessoriesLinkList(
        accessory?: number,
        mainProduct?: number,
        page?: number,
    ): CancelablePromise<PaginatedProductAccessoryList> {
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
    public static apiV1PublicAccessoriesLinkCreate(
        requestBody: ProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
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
    public static apiV1PublicAccessoriesLinkRetrieve(
        id: number,
    ): CancelablePromise<ProductAccessory> {
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
    public static apiV1PublicAccessoriesLinkUpdate(
        id: number,
        requestBody: ProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
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
    public static apiV1PublicAccessoriesLinkPartialUpdate(
        id: number,
        requestBody?: PatchedProductAccessoryRequest,
    ): CancelablePromise<ProductAccessory> {
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
    public static apiV1PublicAccessoriesLinkDestroy(
        id: number,
    ): CancelablePromise<void> {
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
    public static apiV1PublicBundlesList(
        page?: number,
        product?: number,
    ): CancelablePromise<PaginatedPublicBundleList> {
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
    public static apiV1PublicBundlesRetrieve(
        id: number,
    ): CancelablePromise<PublicBundle> {
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
    public static apiV1PublicCartList(
        page?: number,
    ): CancelablePromise<PaginatedCartList> {
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
    public static apiV1PublicCartCreate(
        requestBody?: CartCreateRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartRetrieve(
        id: number,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartUpdate(
        id: number,
        requestBody: CartRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartPartialUpdate(
        id: number,
        requestBody?: PatchedCartRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartDestroy(
        id: number,
    ): CancelablePromise<void> {
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
    public static apiV1PublicCartBundlesCreate(
        id: number,
        requestBody: CartRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartCheckoutCreate(
        id: number,
        requestBody: CartRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartItemsCreate(
        id: number,
        requestBody: CartRequest,
    ): CancelablePromise<Cart> {
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
    public static apiV1PublicCartItemsDestroy(
        id: number,
        itemId: string,
    ): CancelablePromise<void> {
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
    public static apiV1PublicCartRecognizeRetrieve(
        phone: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/cart/recognize/',
            query: {
                'phone': phone,
            },
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
    public static apiV1PublicPhoneSearchList(
        maxPrice?: number,
        minPrice?: number,
        page?: number,
        pageSize?: number,
    ): CancelablePromise<PaginatedPublicProductList> {
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
     * @returns PaginatedPublicProductListList
     * @throws ApiError
     */
    public static apiV1PublicProductsList(
        brandFilter?: string,
        maxPrice?: number,
        minPrice?: number,
        ordering?: string,
        page?: number,
        pageSize?: number,
        promotion?: number,
        search?: string,
        slug?: string,
        type?: string,
    ): CancelablePromise<PaginatedPublicProductListList> {
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
     * Cache public product detail responses.
     * @param id A unique integer value identifying this product.
     * @returns PublicProduct
     * @throws ApiError
     */
    public static apiV1PublicProductsRetrieve(
        id: number,
    ): CancelablePromise<PublicProduct> {
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
     * @param search A search term.
     * @returns PaginatedPublicInventoryUnitPublicList
     * @throws ApiError
     */
    public static apiV1PublicProductsUnitsList(
        id: number,
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedPublicInventoryUnitPublicList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/public/products/{id}/units/',
            path: {
                'id': id,
            },
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicPromotionList
     * @throws ApiError
     */
    public static apiV1PublicPromotionsList(
        page?: number,
    ): CancelablePromise<PaginatedPublicPromotionList> {
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
    public static apiV1PublicPromotionsRetrieve(
        id: number,
    ): CancelablePromise<PublicPromotion> {
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
    public static apiV1PublicReviewsList(
        ordering?: string,
        page?: number,
        product?: number,
        search?: string,
    ): CancelablePromise<PaginatedReviewList> {
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
    public static apiV1PublicReviewsCreate(
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
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
    public static apiV1PublicReviewsRetrieve(
        id: number,
    ): CancelablePromise<Review> {
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
    public static apiV1PublicReviewsUpdate(
        id: number,
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
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
    public static apiV1PublicReviewsPartialUpdate(
        id: number,
        formData?: PatchedReviewRequest,
    ): CancelablePromise<Review> {
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
    public static apiV1PublicReviewsDestroy(
        id: number,
    ): CancelablePromise<void> {
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
    public static apiV1PublicReviewsBulkActionCreate(
        formData: ReviewRequest,
    ): CancelablePromise<Review> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/public/reviews/bulk_action/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
