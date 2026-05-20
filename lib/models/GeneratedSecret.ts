/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Secret } from './Secret';
/**
 * One-time response from POST /admin-api/v1/secret/secrets/generate.
 * `value` is the plaintext that the caller must capture now — it is
 * never retrievable from any other endpoint.
 *
 */
export type GeneratedSecret = {
    secret: Secret;
    /**
     * Plaintext value of the newly-minted secret. Shown once.
     */
    value: string;
};

