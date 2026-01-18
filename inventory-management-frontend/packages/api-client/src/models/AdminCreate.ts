/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
/**
 * Serializer for creating new Admin accounts.
 * Creates both User and Admin objects.
 */
export type AdminCreate = {
    readonly id?: number;
    admin_code: string;
    readonly user?: User;
};

