/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from '../models/Notification';
import type { NotificationRequest } from '../models/NotificationRequest';
import type { PaginatedNotificationList } from '../models/PaginatedNotificationList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * ViewSet for notifications (read-only, with mark-as-read action).
     * @param page A page number within the paginated result set.
     * @returns PaginatedNotificationList
     * @throws ApiError
     */
    public static notificationsList(
        page?: number,
    ): CancelablePromise<PaginatedNotificationList> {
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
    public static notificationsRetrieve(
        id: number,
    ): CancelablePromise<Notification> {
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
    public static notificationsMarkReadCreate(
        id: number,
        requestBody: NotificationRequest,
    ): CancelablePromise<Notification> {
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
    public static notificationsUnreadCountRetrieve(): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/unread_count/',
        });
    }
}
