import type { RatingEnum } from './RatingEnum';
/**
 * Serializes the Review model. Handles the read-only customer relationship.
 * Supports both video file uploads and video URLs.
 */
export type PatchedReviewRequest = {
    product?: number;
    /**
     * Upload a video file from your device (max 100MB)
     */
    video_file?: Blob | null;
    /**
     * Optional link to a video (Google Drive, YouTube, etc.). If both file and URL are provided, URL takes precedence.
     */
    video_url?: string | null;
    review_image?: Blob | null;
    /**
     * Condition at time of purchase (e.g. New, Refurbished, Pre-owned)
     */
    product_condition?: string | null;
    /**
     * Date the item was purchased
     */
    purchase_date?: string | null;
    rating?: RatingEnum;
    comment?: string;
};
