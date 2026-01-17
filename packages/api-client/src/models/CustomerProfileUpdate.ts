/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Dedicated Serializer for RetrieveUpdateAPIView (CustomerProfileView).
 * Allows authenticated users to update their personal details AND returns
 * the full name from the linked User model.
 */
export type CustomerProfileUpdate = {
    readonly id?: number;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    readonly username?: string;
    readonly email?: string;
    readonly first_name?: string;
    readonly last_name?: string;
    phone_number?: string;
    address?: string;
    readonly user?: number | null;
};

