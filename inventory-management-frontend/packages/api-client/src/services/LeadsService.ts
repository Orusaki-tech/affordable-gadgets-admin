/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Lead } from '../models/Lead';
import type { LeadRequest } from '../models/LeadRequest';
import type { PaginatedLeadList } from '../models/PaginatedLeadList';
import type { PatchedLeadRequest } from '../models/PatchedLeadRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeadsService {
    /**
     * Lead management for salespersons only.
     * @param page A page number within the paginated result set.
     * @returns PaginatedLeadList
     * @throws ApiError
     */
    public static leadsList(
        page?: number,
    ): CancelablePromise<PaginatedLeadList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leads/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Lead management for salespersons only.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsCreate(
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Lead management for salespersons only.
     * @param id
     * @returns Lead
     * @throws ApiError
     */
    public static leadsRetrieve(
        id: number,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leads/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Lead management for salespersons only.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsUpdate(
        id: number,
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/leads/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Lead management for salespersons only.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsPartialUpdate(
        id: number,
        requestBody?: PatchedLeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/leads/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Lead management for salespersons only.
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static leadsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/leads/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Self-assign lead (salesperson claims lead). Only salespersons can claim leads.
     * @param id
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsAssignCreate(
        id: number,
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/{id}/assign/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Close lead (no sale) and release inventory units back to stock. Only salespersons can close leads.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsCloseCreate(
        id: number,
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/{id}/close/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Mark lead as contacted. Only salespersons can mark leads as contacted.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsContactCreate(
        id: number,
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/{id}/contact/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Convert lead to order. Only salespersons can convert leads.
     * @param id A unique integer value identifying this lead.
     * @param requestBody
     * @returns Lead
     * @throws ApiError
     */
    public static leadsConvertCreate(
        id: number,
        requestBody: LeadRequest,
    ): CancelablePromise<Lead> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leads/{id}/convert/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
