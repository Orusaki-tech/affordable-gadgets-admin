/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RatingEnum } from './RatingEnum';
/**
 * Serializes the Review model. Handles the read-only customer relationship.
 * Supports both video file uploads and video URLs.
 */
export type Review = {
    readonly id?: number;
    product: number;
    /**
     * Upload a video file from your device (max 100MB)
     */
    video_file?: string | null;
    /**
     * Optional link to a video (Google Drive, YouTube, etc.). If both file and URL are provided, URL takes precedence.
     */
    video_url?: string | null;
    readonly video_file_url?: string | null;
    review_image?: string | null;
    readonly review_image_url?: string | null;
    readonly product_name?: string;
    /**
     * Condition at time of purchase (e.g. New, Refurbished, Pre-owned)
     */
    product_condition?: string | null;
    /**
     * Date the item was purchased
     */
    purchase_date?: string | null;
    readonly customer?: number | null;
    readonly customer_username?: string | null;
    rating: RatingEnum;
    comment: string;
    readonly date_posted?: string;
    readonly is_admin_review?: boolean;
};

