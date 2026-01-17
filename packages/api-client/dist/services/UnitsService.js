import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UnitsService {
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param condition * `N` - New
     * * `R` - Refurbished
     * * `P` - Pre-owned
     * * `D` - Defective
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param productTemplate
     * @param productTemplateBrand
     * @param productTemplateProductType * `PH` - Phone
     * * `LT` - Laptop
     * * `TB` - Tablet/iPad
     * * `AC` - Accessory
     * @param ramGb
     * @param ramGbGte
     * @param saleStatus * `AV` - Available
     * * `SD` - Sold
     * * `RS` - Reserved
     * * `RT` - Returned
     * * `PP` - Pending Payment
     * @param search A search term.
     * @param sellingPrice
     * @param sellingPriceGte
     * @param sellingPriceLte
     * @param storageGb
     * @param storageGbGte
     * @returns PaginatedInventoryUnitList
     * @throws ApiError
     */
    static unitsList(condition, ordering, page, productTemplate, productTemplateBrand, productTemplateProductType, ramGb, ramGbGte, saleStatus, search, sellingPrice, sellingPriceGte, sellingPriceLte, storageGb, storageGbGte) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/units/',
            query: {
                'condition': condition,
                'ordering': ordering,
                'page': page,
                'product_template': productTemplate,
                'product_template__brand': productTemplateBrand,
                'product_template__product_type': productTemplateProductType,
                'ram_gb': ramGb,
                'ram_gb__gte': ramGbGte,
                'sale_status': saleStatus,
                'search': search,
                'selling_price': sellingPrice,
                'selling_price__gte': sellingPriceGte,
                'selling_price__lte': sellingPriceLte,
                'storage_gb': storageGb,
                'storage_gb__gte': storageGbGte,
            },
        });
    }
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/units/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param id A unique integer value identifying this inventory unit.
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/units/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param id A unique integer value identifying this inventory unit.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/units/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param id A unique integer value identifying this inventory unit.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/units/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * CRUD for individual physical Inventory Units.
     * - Inventory Manager: Full access (read/write)
     * - Marketing Manager: Read-only access
     * - Salesperson: Read-only access
     * - Superuser: Full access
     *
     * NEW: Includes filtering and searching capabilities for efficient inventory management.
     * @param id A unique integer value identifying this inventory unit.
     * @returns void
     * @throws ApiError
     */
    static unitsDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/units/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Admin action to approve a RETURNED buyback item and make it AVAILABLE.
     * Only buyback items (source=BB) with status RETURNED can be approved.
     *
     * Note: If a pending ReturnRequest exists for this unit, it should be approved via
     * the ReturnRequestViewSet instead to maintain proper workflow.
     * @param id A unique integer value identifying this inventory unit.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsApproveBuybackCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/units/{id}/approve_buyback/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Create an order from a RESERVED unit - transitions to PENDING_PAYMENT.
     * @param id A unique integer value identifying this inventory unit.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsCreateOrderCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/units/{id}/create_order/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Public: Browse all available units (public fields), with optional filters.
     * Intended for storefront discovery pages (shop/browse/search).
     * @param page A page number within the paginated result set.
     * @returns PaginatedPublicInventoryUnitAdminList
     * @throws ApiError
     */
    static unitsAvailableList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/units/available/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Bulk update operations for inventory units (Inventory Manager only).
     * Supports: price updates, status changes, archiving (for sold units).
     *
     * Request body:
     * {
         * "unit_ids": [1, 2, 3],
         * "operation": "update_price" | "update_status" | "archive",
         * "data": { ... operation-specific data ... }
         * }
         * @param requestBody
         * @returns InventoryUnit
         * @throws ApiError
         */
    static unitsBulkUpdateCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/units/bulk_update/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Export inventory units to CSV file.
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsExportCsvRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/units/export_csv/',
        });
    }
    /**
     * Import inventory units from CSV file.
     * @param requestBody
     * @returns InventoryUnit
     * @throws ApiError
     */
    static unitsImportCsvCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/units/import_csv/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
