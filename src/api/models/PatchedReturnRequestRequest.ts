/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status214Enum } from './Status214Enum';
/**
 * Serializer for ReturnRequest model (bulk returns).
 */
export type PatchedReturnRequestRequest = {
    unit_ids?: Array<number>;
    status?: Status214Enum;
    /**
     * Optional notes from salesperson
     */
    notes?: string;
};

