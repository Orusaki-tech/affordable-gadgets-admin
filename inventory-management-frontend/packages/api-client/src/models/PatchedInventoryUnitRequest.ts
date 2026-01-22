/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { ConditionEnum } from './ConditionEnum';
import type { GradeEnum } from './GradeEnum';
import type { NullEnum } from './NullEnum';
import type { SourceEnum } from './SourceEnum';
/**
 * Serializes physical Inventory Units.
 * - Phones/Laptops/Tablets: Unique units (serial_number/IMEI), quantity=1.
 * - Accessories: Bulk items (no unique identifier), quantity required and can be > 1.
 */
export type PatchedInventoryUnitRequest = {
    product_template_id?: number;
    product_color_id?: number | null;
    acquisition_source_details_id?: number | null;
    condition?: ConditionEnum;
    source?: SourceEnum;
    available_online?: boolean;
    grade?: (GradeEnum | BlankEnum | NullEnum) | null;
    /**
     * Date the unit was acquired
     */
    date_sourced?: string | null;
    cost_of_unit?: string;
    selling_price?: string;
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
};

