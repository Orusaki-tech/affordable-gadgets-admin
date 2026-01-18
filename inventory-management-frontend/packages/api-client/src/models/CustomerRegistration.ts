/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * NEW: Serializer to handle the creation of both a User account and its linked
 * Customer profile in one atomic transaction.
 */
export type CustomerRegistration = {
    username: string;
    email: string;
    phone_number?: string;
    address?: string;
};

