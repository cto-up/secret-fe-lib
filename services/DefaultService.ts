/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSecretRequest } from '../models/CreateSecretRequest';
import type { Secret } from '../models/Secret';
import type { SecretStatus } from '../models/SecretStatus';
import type { CancelablePromise } from 'core-fe-lib/openapi/core/core/CancelablePromise';
import { OpenAPI } from 'core-fe-lib/openapi/core/core/OpenAPI';
import { request as __request } from 'core-fe-lib/openapi/core/core/request';
export class DefaultService {
    /**
     * List secrets. SUPER_ADMIN sees all tenants; ADMIN sees only their own tenant. Supports filtering by status and connector_type.
     * @param status Filter by status (active, revoked)
     * @param connectorType Filter by connector type
     * @param tenantId Filter by tenant ID (SUPER_ADMIN only)
     * @param page
     * @param pageSize
     * @returns Secret List of secrets
     * @throws ApiError
     */
    public static listSecrets(
        status?: SecretStatus,
        connectorType?: string,
        tenantId?: string,
        page: number = 1,
        pageSize: number = 50,
    ): CancelablePromise<Array<Secret>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin-api/v1/secret/secrets',
            query: {
                'status': status,
                'connector_type': connectorType,
                'tenant_id': tenantId,
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a tenant-scoped secret. The plaintext value is
     * encrypted (AES-256-GCM) before persistence and never echoed
     * back. Requires ADMIN / CUSTOMER_ADMIN / SUPER_ADMIN.
     *
     * @param requestBody
     * @returns Secret Secret created
     * @throws ApiError
     */
    public static createSecret(
        requestBody: CreateSecretRequest,
    ): CancelablePromise<Secret> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin-api/v1/secret/secrets',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                409: `A secret with this name already exists for the tenant`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Hard-delete a secret (any status). Requires ADMIN or above.
     * @param id Secret ID
     * @returns void
     * @throws ApiError
     */
    public static deleteSecret(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin-api/v1/secret/secrets/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Revoke a secret so it can no longer be used by connectors. Requires ADMIN or above.
     * @param id Secret ID
     * @returns Secret Secret revoked
     * @throws ApiError
     */
    public static revokeSecret(
        id: string,
    ): CancelablePromise<Secret> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin-api/v1/secret/secrets/{id}/revoke',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
    }
}
