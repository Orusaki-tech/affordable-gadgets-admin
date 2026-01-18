/**
 * Serializer to handle username/email and password authentication.
 */
export type CustomerLogin = {
    readonly token?: string;
    readonly user_id?: number;
    readonly email?: string;
};
