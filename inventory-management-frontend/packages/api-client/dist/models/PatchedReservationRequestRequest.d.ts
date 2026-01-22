import type { ReservationRequestStatusEnum } from './ReservationRequestStatusEnum';
/**
 * Serializer for ReservationRequest model.
 */
export type PatchedReservationRequestRequest = {
    inventory_unit_id?: number | null;
    inventory_unit_ids?: Array<number>;
    inventory_unit_quantities?: Record<string, number>;
    status?: ReservationRequestStatusEnum;
    /**
     * Additional notes or comments
     */
    notes?: string;
};
