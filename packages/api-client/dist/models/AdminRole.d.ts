import type { NameEnum } from './NameEnum';
/**
 * Serializer for AdminRole model.
 */
export type AdminRole = {
    readonly id?: number;
    name: NameEnum;
    display_name: string;
    readonly role_code?: string;
    readonly role_name?: string;
    description?: string;
    readonly created_at?: string;
    readonly updated_at?: string;
};
