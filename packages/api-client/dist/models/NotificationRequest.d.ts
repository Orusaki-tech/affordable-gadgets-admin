import type { NotificationTypeEnum } from './NotificationTypeEnum';
/**
 * Serializer for Notification model.
 */
export type NotificationRequest = {
    notification_type: NotificationTypeEnum;
    title: string;
    message: string;
    is_read?: boolean;
    content_type?: number | null;
    object_id?: number | null;
};
