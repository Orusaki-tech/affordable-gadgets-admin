import type { Lead } from '../models/Lead';
import type { LeadRequest } from '../models/LeadRequest';
import type { PaginatedLeadList } from '../models/PaginatedLeadList';
import type { PatchedLeadRequest } from '../models/PatchedLeadRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LeadsService {
    /**
     * Lead management for salespersons only.
     * @param page A page number within the paginated result set.
     * @returns PaginatedLeadList
     * @throws ApiError
     */
    static leadsList(page?: number): CancelablePromise<PaginatedLeadList>;
    /**
     * Lead management for salespersons only.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsCreate(requestBody: LeadRequest): CancelablePromise<Lead>;
    /**
     * Lead management for salespersons only.
     * @param id
     * @returns Lead
     * @throws ApiError
     */
    static leadsRetrieve(id: number): CancelablePromise<Lead>;
    /**
     * Lead management for salespersons only.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsUpdate(id: number, requestBody: LeadRequest): CancelablePromise<Lead>;
    /**
     * Lead management for salespersons only.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsPartialUpdate(id: number, requestBody?: PatchedLeadRequest): CancelablePromise<Lead>;
    /**
     * Lead management for salespersons only.
     * @param id
     * @returns void
     * @throws ApiError
     */
    static leadsDestroy(id: number): CancelablePromise<void>;
    /**
     * Self-assign lead (salesperson claims lead). Only salespersons can claim leads.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsAssignCreate(id: number, requestBody: LeadRequest): CancelablePromise<Lead>;
    /**
     * Close lead (no sale) and release inventory units back to stock. Only salespersons can close leads.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsCloseCreate(id: number, requestBody: LeadRequest): CancelablePromise<Lead>;
    /**
     * Mark lead as contacted. Only salespersons can mark leads as contacted.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsContactCreate(id: number, requestBody: LeadRequest): CancelablePromise<Lead>;
    /**
     * Convert lead to order. Only salespersons can convert leads.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    static leadsConvertCreate(id: number, requestBody: LeadRequest): CancelablePromise<Lead>;
}
