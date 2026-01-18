/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionEnum } from './ActionEnum';
/**
 * Serializer for AuditLog model (read-only).
 */
export type AuditLog = {
    readonly id?: number;
    /**
     * User who performed the action
     */
    readonly user?: number | null;
    readonly user_username?: string | null;
    readonly user_email?: string | null;
    readonly action?: ActionEnum;
    readonly action_display?: string;
    /**
     * Name of the model affected
     */
    readonly model_name?: string;
    /**
     * ID of the affected object
     */
    readonly object_id?: number;
    /**
     * String representation of the object
     */
    readonly object_repr?: string;
    /**
     * Previous state (for updates)
     */
    readonly old_value?: any;
    /**
     * New state (for creates/updates)
     */
    readonly new_value?: any;
    readonly ip_address?: string | null;
    readonly user_agent?: string;
    readonly timestamp?: string;
};

