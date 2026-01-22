import type { BundleItem } from './BundleItem';
export type PaginatedBundleItemList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<BundleItem>;
};
