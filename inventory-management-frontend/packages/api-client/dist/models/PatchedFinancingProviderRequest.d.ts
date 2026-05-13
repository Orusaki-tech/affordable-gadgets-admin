/**
 * Serializer for BNPL financing providers.
 */
export type PatchedFinancingProviderRequest = {
    name?: string;
    slug?: string;
    logo?: Blob | null;
    is_active?: boolean;
};
