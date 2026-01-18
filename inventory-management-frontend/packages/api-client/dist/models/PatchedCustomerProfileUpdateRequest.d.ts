/**
 * Dedicated Serializer for RetrieveUpdateAPIView (CustomerProfileView).
 * Allows authenticated users to update their personal details AND returns
 * the full name from the linked User model.
 */
export type PatchedCustomerProfileUpdateRequest = {
    phone_number?: string;
    address?: string;
};
