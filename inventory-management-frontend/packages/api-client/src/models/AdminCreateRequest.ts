/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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

