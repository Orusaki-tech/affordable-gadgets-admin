/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { Color } from './Color';
import type { ConditionEnum } from './ConditionEnum';
import type { GradeEnum } from './GradeEnum';
import type { NullEnum } from './NullEnum';
export type PublicInventoryUnitAdmin = {
    readonly id?: number;
    readonly product_template_name?: string;
    readonly product_brand?: string;
    readonly product_type?: string;
    condition?: ConditionEnum;
    grade?: (GradeEnum | BlankEnum | NullEnum) | null;
    selling_price: string;
    storage_gb?: number | null;
    ram_gb?: number | null;
    is_sim_enabled?: boolean;
    processor_details?: string;
    readonly product_color?: Color;
};

