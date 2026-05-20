/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Payload for POST /admin-api/v1/secret/secrets/generate.
 * Server mints a strong random value (crypto/rand → hex)
 * and stores it encrypted. The plaintext is returned in the
 * response exactly once — never persisted in plaintext nor
 * retrievable later.
 *
 */
export type GenerateSecretRequest = {
    /**
     * Unique name within the tenant
     */
    name: string;
    /**
     * Consumer hint (lre_api, smtp, openai, webhook-hmac…)
     */
    connector_type: string;
    description?: string | null;
    /**
     * Number of random bytes to mint before hex-encoding (default 32 → 64 hex chars). Capped at 128.
     */
    length_bytes?: number;
};

