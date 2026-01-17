/**
 * Serializer to handle username/email and password authentication.
 */
export type CustomerLoginRequest = {
    username_or_email: string;
    password: string;
};
