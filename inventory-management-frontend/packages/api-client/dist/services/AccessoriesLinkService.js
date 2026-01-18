import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccessoriesLinkService {
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
    static accessoriesLinkList(accessory, mainProduct, page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accessories-link/',
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
    static accessoriesLinkCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/accessories-link/',
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
    static accessoriesLinkRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/accessories-link/{id}/',
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
    static accessoriesLinkUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/accessories-link/{id}/',
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
    static accessoriesLinkPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/accessories-link/{id}/',
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
    static accessoriesLinkDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/accessories-link/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
