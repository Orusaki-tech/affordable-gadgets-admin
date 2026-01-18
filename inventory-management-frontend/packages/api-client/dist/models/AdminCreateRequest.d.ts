/**
 * Serializer for creating new Admin accounts.
 * Creates both User and Admin objects.
 */
export type AdminCreateRequest = {
    username: string;
    email: string;
    password: string;
    admin_code: string;
};
