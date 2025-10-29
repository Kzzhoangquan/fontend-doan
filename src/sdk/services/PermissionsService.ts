/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionEntity } from '../models/PermissionEntity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PermissionsService {
  /**
   * Get all permissions
   * @returns PermissionEntity List of all permissions
   * @throws ApiError
   */
  public static permissionsControllerFindAll(): CancelablePromise<
    Array<PermissionEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/permissions',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * Get permissions by resource
   * @returns PermissionEntity Permissions for specific resource
   * @throws ApiError
   */
  public static permissionsControllerFindByResource({
    resource,
  }: {
    /**
     * Resource name (e.g., user, document, role)
     */
    resource: string;
  }): CancelablePromise<Array<PermissionEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/permissions/resource/{resource}',
      path: {
        resource: resource,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * Get permission by ID
   * @returns PermissionEntity Permission found
   * @throws ApiError
   */
  public static permissionsControllerFindOne({
    id,
  }: {
    /**
     * Permission ID
     */
    id: string;
  }): CancelablePromise<PermissionEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/permissions/{id}',
      path: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
        404: `Permission not found`,
      },
    });
  }
}
