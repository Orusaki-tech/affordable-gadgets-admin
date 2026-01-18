/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedUnitAcquisitionSourceList } from '../models/PaginatedUnitAcquisitionSourceList';
import type { PatchedUnitAcquisitionSourceRequest } from '../models/PatchedUnitAcquisitionSourceRequest';
import type { UnitAcquisitionSource } from '../models/UnitAcquisitionSource';
import type { UnitAcquisitionSourceRequest } from '../models/UnitAcquisitionSourceRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
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
    public static sourcesList(
        page?: number,
    ): CancelablePromise<PaginatedUnitAcquisitionSourceList> {
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
    public static sourcesCreate(
        requestBody: UnitAcquisitionSourceRequest,
    ): CancelablePromise<UnitAcquisitionSource> {
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
    public static sourcesRetrieve(
        id: number,
    ): CancelablePromise<UnitAcquisitionSource> {
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
    public static sourcesUpdate(
        id: number,
        requestBody: UnitAcquisitionSourceRequest,
    ): CancelablePromise<UnitAcquisitionSource> {
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
    public static sourcesPartialUpdate(
        id: number,
        requestBody?: PatchedUnitAcquisitionSourceRequest,
    ): CancelablePromise<UnitAcquisitionSource> {
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
    public static sourcesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/sources/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
