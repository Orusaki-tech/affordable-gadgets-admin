import type { Notification } from './Notification';
export type PaginatedNotificationList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Notification>;
};
