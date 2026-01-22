/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { Color } from './Color';
import type { ConditionEnum } from './ConditionEnum';
import type { GradeEnum } from './GradeEnum';
import type { NullEnum } from './NullEnum';
import type { SourceEnum } from './SourceEnum';
import type { UnitAcquisitionSource } from './UnitAcquisitionSource';
/**
 * Serializes physical Inventory Units.
 * - Phones/Laptops/Tablets: Unique units (serial_number/IMEI), quantity=1.
 * - Accessories: Bulk items (no unique identifier), quantity required and can be > 1.
 */
export type InventoryUnit = {
    readonly id?: number;
    readonly product_template?: number;
    readonly product_template_name?: string;
    readonly product_brand?: string;
    readonly product_type?: string;
    readonly product_color?: Color;
    readonly color_name?: string;
    readonly acquisition_source_details?: UnitAcquisitionSource;
    condition?: ConditionEnum;
    source?: SourceEnum;
    readonly sale_status?: string;
    available_online?: boolean;
    grade?: (GradeEnum | BlankEnum | NullEnum) | null;
    /**
     * Date the unit was acquired
     */
    date_sourced?: string | null;
    cost_of_unit: string;
    selling_price: string;
    /**
     * Quantity: 1 for Phones/Laptops/Tablets (unique units). Required and can be > 1 for Accessories (no unique identifier).
     */
    quantity?: number;
    /**
     * Required for Phones/Laptops/Tablets. Optional for Accessories.
     */
    serial_number?: string | null;
    /**
     * IMEI for Phones/SIM-enabled Tablets
     */
    imei?: string | null;
    storage_gb?: number | null;
    ram_gb?: number | null;
    /**
     * Battery capacity in mAh
     */
    battery_mah?: number | null;
    is_sim_enabled?: boolean;
    processor_details?: string;
    readonly images?: Array<Record<string, any>>;
    readonly reserved_by_id?: number;
    readonly reserved_by_username?: string;
    readonly reserved_until?: string;
    /**
     * Check if current user can reserve this unit.
     */
    readonly can_reserve?: boolean;
    /**
     * Check if current user can request transfer of this unit.
     */
    readonly can_transfer?: boolean;
    readonly is_reservation_expired?: boolean;
};

