/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SecretStatus } from './SecretStatus';
export type Secret = {
    id: string;
    /**
     * Human-readable name for this secret, unique per tenant
     */
    name: string;
    /**
     * Type of connector this secret belongs to (e.g. smtp, slack, stripe)
     */
    connector_type: string;
    /**
     * Optional human-readable note about this secret
     */
    description?: string | null;
    status: SecretStatus;
    tenant_id?: string | null;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
};

