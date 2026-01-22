/**
 * Custom admin authentication serializer that:
 * 1. Accepts both username and email (for backward compatibility, 'username' can be an email)
 * 2. Checks that user has is_staff=True before allowing login
 */
export type AdminAuthToken = {
    username?: string;
    password: string;
};
