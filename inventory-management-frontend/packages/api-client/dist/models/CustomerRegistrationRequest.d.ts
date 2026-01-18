/**
 * NEW: Serializer to handle the creation of both a User account and its linked
 * Customer profile in one atomic transaction.
 */
export type CustomerRegistrationRequest = {
    username: string;
    email: string;
    password: string;
    phone_number?: string;
    address?: string;
};
