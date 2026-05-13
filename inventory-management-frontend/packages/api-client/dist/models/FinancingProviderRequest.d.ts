/**
 * Serializer for BNPL financing providers.
 */
export type FinancingProviderRequest = {
    name: string;
    slug?: string;
    logo?: Blob | null;
    is_active?: boolean;
};
