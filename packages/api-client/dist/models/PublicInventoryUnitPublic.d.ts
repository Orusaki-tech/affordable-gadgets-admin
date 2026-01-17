import type { BlankEnum } from './BlankEnum';
import type { ConditionEnum } from './ConditionEnum';
import type { GradeEnum } from './GradeEnum';
import type { NullEnum } from './NullEnum';
/**
 * Public unit serializer with interest count.
 */
export type PublicInventoryUnitPublic = {
    readonly id?: number;
    readonly product_id?: number;
    readonly product_name?: string;
    readonly product_slug?: string;
    selling_price: string;
    condition?: ConditionEnum;
    grade?: (GradeEnum | BlankEnum | NullEnum) | null;
    storage_gb?: number | null;
    ram_gb?: number | null;
    /**
     * Battery capacity in mAh
     */
    battery_mah?: number | null;
    product_color?: number | null;
    readonly color_name?: string | null;
    readonly interest_count?: number;
    readonly images?: Array<Record<string, any>>;
};
