import type { SourceTypeEnum } from './SourceTypeEnum';
/**
 * Serializer for managing Supplier and Import Partner contact details (CRUD endpoint).
 */
export type UnitAcquisitionSource = {
    readonly id?: number;
    source_type: SourceTypeEnum;
    /**
     * Name of the company or contact person.
     */
    name: string;
    phone_number?: string;
};
