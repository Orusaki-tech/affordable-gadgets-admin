import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * ViewSet for notifications (read-only, with mark-as-read action).
     * @param page A page number within the paginated result set.
     * @returns PaginatedNotificationList
     * @throws ApiError
     */
    static notificationsList(page) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/',
            query: {
                'page': page,
            },
        });
    }
    /**
     * ViewSet for notifications (read-only, with mark-as-read action).
     * @param id A unique integer value identifying this notification.
     * @returns Notification
     * @throws ApiError
     */
    static notificationsRetrieve(id) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mark a notification as read.
     * @param id A unique integer value identifying this notification.
     * @param requestBody
     * @returns Notification
     * @throws ApiError
     */
    static notificationsMarkReadCreate(id, requestBody) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/{id}/mark_read/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get count of unread notifications.
     * @returns Notification
     * @throws ApiError
     */
    static notificationsUnreadCountRetrieve() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/unread_count/',
        });
    }
}
