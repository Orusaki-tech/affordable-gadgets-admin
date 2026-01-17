import type { Notification } from '../models/Notification';
import type { NotificationRequest } from '../models/NotificationRequest';
import type { PaginatedNotificationList } from '../models/PaginatedNotificationList';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class NotificationsService {
    /**
     * ViewSet for notifications (read-only, with mark-as-read action).
     * @param page A page number within the paginated result set.
     * @returns PaginatedNotificationList
     * @throws ApiError
     */
    static notificationsList(page?: number): CancelablePromise<PaginatedNotificationList>;
    /**
     * ViewSet for notifications (read-only, with mark-as-read action).
     * @param id A unique integer value identifying this notification.
     * @returns Notification
     * @throws ApiError
     */
    static notificationsRetrieve(id: number): CancelablePromise<Notification>;
    /**
     * Mark a notification as read.
     * @param id A unique integer value identifying this notification.
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    static notificationsMarkReadCreate(id: number, requestBody: NotificationRequest): CancelablePromise<Notification>;
    /**
     * Get count of unread notifications.
     * @returns Notification
     * @throws ApiError
     */
    static notificationsUnreadCountRetrieve(): CancelablePromise<Notification>;
}
