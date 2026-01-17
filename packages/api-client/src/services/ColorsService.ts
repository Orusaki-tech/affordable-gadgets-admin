/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Color } from '../models/Color';
import type { ColorRequest } from '../models/ColorRequest';
import type { PaginatedColorList } from '../models/PaginatedColorList';
import type { PatchedColorRequest } from '../models/PatchedColorRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ColorsService {
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param page A page number within the paginated result set.
     * @returns PaginatedColorList
     * @throws ApiError
     */
    public static colorsList(
        page?: number,
    ): CancelablePromise<PaginatedColorList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/colors/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    public static colorsCreate(
        requestBody: ColorRequest,
    ): CancelablePromise<Color> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/colors/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns Color
     * @throws ApiError
     */
    public static colorsRetrieve(
        id: number,
    ): CancelablePromise<Color> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    public static colorsUpdate(
        id: number,
        requestBody: ColorRequest,
    ): CancelablePromise<Color> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @param requestBody
     * @returns Color
     * @throws ApiError
     */
    public static colorsPartialUpdate(
        id: number,
        requestBody?: PatchedColorRequest,
    ): CancelablePromise<Color> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Color lookup table. Admin-only write, public read.
     * Uses IsAdminOrReadOnly.
     * @param id A unique integer value identifying this color.
     * @returns void
     * @throws ApiError
     */
    public static colorsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/colors/{id}/',
            path: {
                'id': id,
            },
        });
    }
}
