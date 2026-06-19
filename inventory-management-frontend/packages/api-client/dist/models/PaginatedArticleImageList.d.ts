import type { ArticleImage } from './ArticleImage';
export type PaginatedArticleImageList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<ArticleImage>;
};
