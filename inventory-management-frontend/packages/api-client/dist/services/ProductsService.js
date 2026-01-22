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
     * @param page A page number within the paginated result set.
     * @returns PaginatedProductList
     * @throws ApiError
     */
    static productsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/',
            query: {
                'page': page,
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
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/products/',
            body: requestBody,
            mediaType: 'application/json',
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
     * @returns Product
     * @throws ApiError
     */
    static productsRetrieve(id) {
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
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
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
     * @param requestBody
     * @returns Product
     * @throws ApiError
     */
    static productsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/products/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
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
    static productsDestroy(id) {
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
    static productsAvailableUnitsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}/available-units/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Custom action to retrieve the available inventory count, min price, and max price
     * for a specific Product (template). Accessible by staff users (read-only).
     *
     * Example URL: /api/products/{product_id}/stock-summary/
     * @param id A unique integer value identifying this product.
     * @returns Product
     * @throws ApiError
     */
    static productsStockSummaryRetrieve(id) {
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
    static productsUpdateContentPartialUpdate(id, requestBody) {
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
}
