import type { ReservationRequestStatusEnum } from './ReservationRequestStatusEnum';
/**
 * Serializer for ReservationRequest model.
 */
export type ReservationRequestRequest = {
    inventory_unit_id?: number | null;
    inventory_unit_ids?: Array<number>;
    status?: ReservationRequestStatusEnum;
    /**
     * Additional notes or comments
     */
    notes?: string;
};
