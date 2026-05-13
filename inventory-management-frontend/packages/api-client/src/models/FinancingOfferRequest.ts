/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { NullEnum } from './NullEnum';
import type { TermUnitEnum } from './TermUnitEnum';
/**
 * Serializer for BNPL financing offers.
 */
export type FinancingOfferRequest = {
    provider: number;
    product: number;
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
};

