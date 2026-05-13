import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FinancingProvidersService {
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param ordering Which field to use when ordering the results.
     * @param page A page number within the paginated result set.
     * @param search A search term.
     * @returns PaginatedFinancingProviderList
     * @throws ApiError
     */
    static financingProvidersList(ordering, page, search) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-providers/',
            query: {
                'ordering': ordering,
                'page': page,
                'search': search,
            },
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersCreate(formData) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/financing-providers/',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @param formData
     * @returns FinancingProvider
     * @throws ApiError
     */
    static financingProvidersPartialUpdate(id, formData) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Financing provider management (Inventory Manager / Superuser).
     * @param id A unique integer value identifying this financing provider.
     * @returns void
     * @throws ApiError
     */
    static financingProvidersDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/financing-providers/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
