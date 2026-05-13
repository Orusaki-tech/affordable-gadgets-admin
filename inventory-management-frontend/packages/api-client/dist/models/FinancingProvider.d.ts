/**
 * Serializer for BNPL financing providers.
 */
export type FinancingProvider = {
    readonly id?: number;
    name: string;
    slug?: string;
    logo?: string | null;
    readonly logo_url?: string | null;
    is_active?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
};
