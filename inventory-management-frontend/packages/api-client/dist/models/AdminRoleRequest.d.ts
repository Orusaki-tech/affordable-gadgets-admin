import type { NameEnum } from './NameEnum';
/**
 * Serializer for AdminRole model.
 */
export type AdminRoleRequest = {
    name: NameEnum;
    display_name: string;
    description?: string;
};
