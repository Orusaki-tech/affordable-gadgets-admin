/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PublicReviewSubmitRequest = {
    email: string;
    otp: string;
    product_id: number;
    order_item_id?: number | null;
    rating: number;
    comment: string;
    review_image?: Blob | null;
    video_url?: string | null;
};

