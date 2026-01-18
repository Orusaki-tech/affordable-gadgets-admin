/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReturnRequestStatusEnum } from './ReturnRequestStatusEnum';
/**
 * Serializer for ReturnRequest model (bulk returns).
 */
export type ReturnRequestRequest = {
    unit_ids?: Array<number>;
    status?: ReturnRequestStatusEnum;
    /**
     * Optional notes from salesperson
     */
    notes?: string;
};

