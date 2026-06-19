/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedProductListList } from '../models/PaginatedProductListList';
import type { PatchedProductRequest } from '../models/PatchedProductRequest';
import type { Product } from '../models/Product';
import type { ProductRequest } from '../models/ProductRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedProductListList
     * @throws ApiError
     */
    public static productsList(
        ordering?: string,
        page?: number,
        search?: string,
    ): CancelablePromise<PaginatedProductListList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsCreate(
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Enforce brand access when using the fast-path queryset for single-product fetch.
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    public static productsRetrieve(
        id: number,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsUpdate(
        id: number,
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsPartialUpdate(
        id: number,
        formData?: PatchedProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @returns void
     * @throws ApiError
     */
    public static productsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Public: List available units (public fields) for a specific product template, paginated.
     * Intended for product detail pages to show purchasable configurations.
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    public static productsAvailableUnitsRetrieve(
        id: number,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}/available-units/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete one or more product images.
     *
     * Body:
     * - image_ids: list[int]
     * @param id A unique integer value identifying this product.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsImagesDeleteCreate(
        id: number,
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/{id}/images/delete/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Set a specific product image as primary.
     * @param id A unique integer value identifying this product.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsImagesSetPrimaryCreate(
        id: number,
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/{id}/images/set-primary/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Upload one or more images for a Product.
     *
     * This is intended for Inventory Managers to attach product images directly from the product screen,
     * without needing to call the standalone ProductImage endpoint.
     *
     * Expected multipart form-data:
     * - images: one or more files (recommended field name)
     * OR image: a single file (backward-compatible convenience)
     * - alt_text (optional): string applied to all uploaded images
     * - image_caption (optional): string applied to all uploaded images
     * - start_display_order (optional): integer; if provided, assigns incremental display_order
     * - make_primary (optional): boolean; if true, first uploaded image becomes primary (and clears others)
     * @param id A unique integer value identifying this product.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsImagesUploadCreate(
        id: number,
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/{id}/images/upload/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Custom action to retrieve the available inventory count, min price, and max price
     * for a specific Product (template). Accessible by staff users (read-only).
     *
     * Example URL: /api/inventory/products/{product_id}/stock-summary/
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    public static productsStockSummaryRetrieve(
        id: number,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}/stock-summary/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Custom action for Content Creators to update only content fields.
     * This allows Content Creators to update product content without touching inventory fields.
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    public static productsUpdateContentPartialUpdate(
        id: number,
        requestBody?: PatchedProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/products/{id}/update_content/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete products by ID list or delete all product-related data (full reset).
     *
     * - To delete specific products (and their units/bundle items): POST with body
     * {"product_ids": [1, 2, 3]}. Same permission as single-product delete.
     *
     * - To delete every product and all dependent data (orders, carts, units, etc.): POST with
     * {"delete_all": true}. Use only in dev/staging. Requires Inventory Manager or Superuser.
     * @param formData
     * @returns Product
     * @throws ApiError
     */
    public static productsBulkDestroyCreate(
        formData: ProductRequest,
    ): CancelablePromise<Product> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/bulk-destroy/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
