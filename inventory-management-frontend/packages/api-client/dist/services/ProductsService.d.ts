import type { PaginatedProductListList } from '../models/PaginatedProductListList';
import type { PatchedProductRequest } from '../models/PatchedProductRequest';
import type { Product } from '../models/Product';
import type { ProductRequest } from '../models/ProductRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProductsService {
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
    static productsList(ordering?: string, page?: number, search?: string): CancelablePromise<PaginatedProductListList>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsCreate(requestBody: ProductRequest): CancelablePromise<Product>;
    /**
     * Enforce brand access when using the fast-path queryset for single-product fetch.
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    static productsRetrieve(id: number): CancelablePromise<Product>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsUpdate(id: number, requestBody: ProductRequest): CancelablePromise<Product>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can update content via update_content only (no create/delete)
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsPartialUpdate(id: number, requestBody?: PatchedProductRequest): CancelablePromise<Product>;
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
    static productsDestroy(id: number): CancelablePromise<void>;
    /**
     * Public: List available units (public fields) for a specific product template, paginated.
     * Intended for product detail pages to show purchasable configurations.
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    static productsAvailableUnitsRetrieve(id: number): CancelablePromise<Product>;
    /**
     * Delete one or more product images.
     *
     * Body:
     * - image_ids: list[int]
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsImagesDeleteCreate(id: number, requestBody: ProductRequest): CancelablePromise<Product>;
    /**
     * Set a specific product image as primary.
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsImagesSetPrimaryCreate(id: number, requestBody: ProductRequest): CancelablePromise<Product>;
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
    static productsImagesUploadCreate(id: number, formData: ProductRequest): CancelablePromise<Product>;
    /**
     * Custom action to retrieve the available inventory count, min price, and max price
     * for a specific Product (template). Accessible by staff users (read-only).
     *
     * Example URL: /api/products/{product_id}/stock-summary/
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    static productsStockSummaryRetrieve(id: number): CancelablePromise<Product>;
    /**
     * Custom action for Content Creators to update only content fields.
     * This allows Content Creators to update product content without touching inventory fields.
     * @param id A unique integer value identifying this product.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsUpdateContentPartialUpdate(id: number, requestBody?: PatchedProductRequest): CancelablePromise<Product>;
    /**
     * Delete products by ID list or delete all product-related data (full reset).
     *
     * - To delete specific products (and their units/bundle items): POST with body
     * {"product_ids": [1, 2, 3]}. Same permission as single-product delete.
     *
     * - To delete every product and all dependent data (orders, carts, units, etc.): POST with
     * {"delete_all": true}. Use only in dev/staging. Requires Inventory Manager or Superuser.
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsBulkDestroyCreate(requestBody: ProductRequest): CancelablePromise<Product>;
}
