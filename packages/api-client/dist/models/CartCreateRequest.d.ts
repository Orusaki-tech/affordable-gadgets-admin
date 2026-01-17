/**
 * Serializer for cart creation (session + customer context).
 */
export type CartCreateRequest = {
    session_key?: string;
    customer_phone?: string;
};
