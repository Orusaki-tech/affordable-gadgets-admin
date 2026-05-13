import type { FinancingProvider } from './FinancingProvider';
export type PaginatedFinancingProviderList = {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: Array<FinancingProvider>;
};
