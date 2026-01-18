import type { Review } from './Review';
export type PaginatedReviewList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Review>;
};
