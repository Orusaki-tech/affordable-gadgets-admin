/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for the Admin profile, extending the base User details.
 * Used for nested viewing and AdminProfileView retrieval.
 */
export type AdminRequest = {
    admin_code: string;
    role_ids?: Array<number>;
    brand_ids?: Array<number>;
};

