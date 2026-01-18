import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SourcesService {
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedUnitAcquisitionSourceList
     * @throws ApiError
     */
    static sourcesList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sources/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesCreate(requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sources/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sources/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sources/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesPartialUpdate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/sources/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @returns void
     * @throws ApiError
     */
    static sourcesDestroy(id) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/sources/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
