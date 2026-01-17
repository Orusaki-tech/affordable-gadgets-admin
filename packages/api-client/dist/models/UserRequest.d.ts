/**
 * Basic User serialization for nested views.
 */
export type UserRequest = {
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username: string;
    email?: string;
};
