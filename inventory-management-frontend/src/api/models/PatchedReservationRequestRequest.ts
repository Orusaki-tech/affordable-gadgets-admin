/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusC79Enum } from './StatusC79Enum';
/**
 * Serializer for ReservationRequest model.
 */
export type PatchedReservationRequestRequest = {
    inventory_unit_id?: number | null;
    inventory_unit_ids?: Array<number>;
    status?: StatusC79Enum;
    /**
     * Additional notes or comments
     */
    notes?: string;
};

