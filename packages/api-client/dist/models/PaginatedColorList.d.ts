import type { Color } from './Color';
export type PaginatedColorList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<Color>;
};
