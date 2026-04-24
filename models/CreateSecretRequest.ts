/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Payload for POST /admin-api/v1/secret/secrets. `value`
 * is stored encrypted (AES-256-GCM); it is never echoed
 * back by any endpoint.
 *
 */
export type CreateSecretRequest = {
    /**
     * Unique name within the tenant
     */
    name: string;
    /**
     * Plaintext; encrypted at rest
     */
    value: string;
    /**
     * Consumer hint (lre_api, smtp, openai…)
     */
    connector_type: string;
    description?: string | null;
};

