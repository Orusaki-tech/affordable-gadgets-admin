/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { NullEnum } from './NullEnum';
import type { TermUnitEnum } from './TermUnitEnum';
export type PublicFinancingOffer = {
    readonly id?: number;
    provider: number;
    readonly provider_name?: string;
    readonly provider_slug?: string;
    readonly provider_logo_url?: string | null;
    deposit_amount: string;
    retail_amount: string;
    term_unit?: (TermUnitEnum | BlankEnum | NullEnum) | null;
    term_count?: number | null;
    daily_payment?: string | null;
    weekly_payment?: string | null;
    monthly_payment?: string | null;
    ram_gb?: number | null;
    rom_gb?: number | null;
};

