import type { NotificationTypeEnum } from './NotificationTypeEnum';
/**
 * Serializer for Notification model.
 */
export type Notification = {
    readonly id?: number;
    readonly recipient?: number;
    readonly recipient_username?: string;
    notification_type: NotificationTypeEnum;
    readonly notification_type_display?: string;
    title: string;
    message: string;
    is_read?: boolean;
    readonly created_at?: string;
    content_type?: number | null;
    object_id?: number | null;
    readonly content_type_model?: string | null;
};
