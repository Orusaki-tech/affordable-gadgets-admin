import type { BlankEnum } from './BlankEnum';
import type { ConditionEnum } from './ConditionEnum';
import type { GradeEnum } from './GradeEnum';
import type { NullEnum } from './NullEnum';
/**
 * Public unit serializer with interest count.
 */
export type PublicInventoryUnitPublicRequest = {
    selling_price: string;
    /**
     * Original/list price used to show discounts (optional)
     */
    compare_at_price?: string | null;
    condition?: ConditionEnum;
    grade?: (GradeEnum | BlankEnum | NullEnum) | null;
    storage_gb?: number | null;
    ram_gb?: number | null;
    /**
     * Battery capacity in mAh
     */
    battery_mah?: number | null;
    product_color?: number | null;
};
