import type { PaginatedProductList } from '../models/PaginatedProductList';
import type { PatchedProductRequest } from '../models/PatchedProductRequest';
import type { Product } from '../models/Product';
import type { ProductRequest } from '../models/ProductRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProductsService {
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductList
     * @throws ApiError
     */
    static productsList(page?: number): CancelablePromise<PaginatedProductList>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsCreate(requestBody: ProductRequest): CancelablePromise<Product>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
     * - Salesperson: Read-only access
     * - Superuser: Full access
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    static productsRetrieve(id: number): CancelablePromise<Product>;
    /**
     * CRUD for Product Templates.
     * - Public: Read-only access
     * - Inventory Manager: Full CRUD access
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
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
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
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
     * - Content Creator: Can edit content fields (descriptions, images, SEO) but NOT inventory fields, and CANNOT delete products
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
}
