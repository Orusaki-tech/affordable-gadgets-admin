import type { AdminRole } from './AdminRole';
import type { User } from './User';
/**
 * Serializer for the Admin profile, extending the base User details.
 * Used for nested viewing and AdminProfileView retrieval.
 */
export type Admin = {
    readonly id?: number;
    readonly user?: User;
    readonly username?: string;
    readonly email?: string;
    admin_code: string;
    readonly last_login?: string;
    readonly date_joined?: string;
    readonly roles?: Array<AdminRole>;
    readonly brands?: Array<Record<string, any>>;
    readonly is_global_admin?: boolean;
    /**
     * Count of units currently reserved by this admin.
     */
    readonly reserved_units_count?: number;
};
