/* generated using openapi-typescript-codegen -- do not edit */
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
    readonly video_file_url?: string;
    readonly product_name?: string;
    readonly customer?: number | null;
    readonly customer_username?: string;
    rating: RatingEnum;
    comment: string;
    readonly date_posted?: string;
    readonly is_admin_review?: boolean;
};

