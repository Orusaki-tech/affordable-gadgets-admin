import type { ReservationRequest } from './ReservationRequest';
export type PaginatedReservationRequestList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ReservationRequest>;
};
