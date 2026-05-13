import type { BlankEnum } from './BlankEnum';
import type { NullEnum } from './NullEnum';
import type { TermUnitEnum } from './TermUnitEnum';
/**
 * Serializer for BNPL financing offers.
 */
export type FinancingOffer = {
    readonly id?: number;
    provider: number;
    readonly provider_name?: string;
    readonly provider_slug?: string;
    readonly provider_logo_url?: string | null;
    product: number;
    readonly product_name?: string;
    deposit_amount: string;
    retail_amount: string;
    term_unit?: (TermUnitEnum | BlankEnum | NullEnum) | null;
    term_count?: number | null;
    daily_payment?: string | null;
    weekly_payment?: string | null;
    monthly_payment?: string | null;
    ram_gb?: number | null;
    rom_gb?: number | null;
    is_active?: boolean;
    readonly created_at?: string;
    readonly updated_at?: string;
};
