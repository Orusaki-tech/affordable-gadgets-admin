import type { PaginatedUnitAcquisitionSourceList } from '../models/PaginatedUnitAcquisitionSourceList';
import type { PatchedUnitAcquisitionSourceRequest } from '../models/PatchedUnitAcquisitionSourceRequest';
import type { UnitAcquisitionSource } from '../models/UnitAcquisitionSource';
import type { UnitAcquisitionSourceRequest } from '../models/UnitAcquisitionSourceRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class SourcesService {
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedUnitAcquisitionSourceList
     * @throws ApiError
     */
    static sourcesList(page?: number): CancelablePromise<PaginatedUnitAcquisitionSourceList>;
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesCreate(requestBody: UnitAcquisitionSourceRequest): CancelablePromise<UnitAcquisitionSource>;
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesRetrieve(id: number): CancelablePromise<UnitAcquisitionSource>;
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesUpdate(id: number, requestBody: UnitAcquisitionSourceRequest): CancelablePromise<UnitAcquisitionSource>;
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @param requestBody
     * @returns UnitAcquisitionSource
     * @throws ApiError
     */
    static sourcesPartialUpdate(id: number, requestBody?: PatchedUnitAcquisitionSourceRequest): CancelablePromise<UnitAcquisitionSource>;
    /**
     * Acquisition Source lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this unit acquisition source.
     * @returns void
     * @throws ApiError
     */
    static sourcesDestroy(id: number): CancelablePromise<void>;
}
