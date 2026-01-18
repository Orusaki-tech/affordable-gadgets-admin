/**
 * Basic User serialization for nested views.
 */
export type User = {
    readonly id?: number;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username: string;
    email?: string;
    readonly last_login?: string | null;
    readonly date_joined?: string;
    /**
     * Designates whether the user can log into this admin site.
     */
    readonly is_staff?: boolean;
    /**
     * Designates that this user has all permissions without explicitly assigning them.
     */
    readonly is_superuser?: boolean;
};
