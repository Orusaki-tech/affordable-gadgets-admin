import type { ReturnRequestStatusEnum } from './ReturnRequestStatusEnum';
/**
 * Serializer for ReturnRequest model (bulk returns).
 */
export type PatchedReturnRequestRequest = {
    unit_ids?: Array<number>;
    status?: ReturnRequestStatusEnum;
    /**
     * Optional notes from salesperson
     */
    notes?: string;
};
