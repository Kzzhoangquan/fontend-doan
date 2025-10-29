/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserEntity } from '../models/UserEntity';
import type { UserSummaryEntity } from '../models/UserSummaryEntity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
  /**
   * Create a new user
   * @returns UserEntity User created successfully
   * @throws ApiError
   */
  public static usersControllerCreate({
    requestBody,
  }: {
    requestBody: CreateUserDto;
  }): CancelablePromise<UserEntity> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/users',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request`,
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * Get all users
   * @returns UserEntity List of users
   * @throws ApiError
   */
  public static usersControllerFindAll(): CancelablePromise<Array<UserEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * Get all users by company ID
   * @returns UserEntity List of users for company
   * @throws ApiError
   */
  public static usersControllerFindByCompany({
    companyId,
  }: {
    companyId: string;
  }): CancelablePromise<Array<UserEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/company/{companyId}',
      path: {
        companyId: companyId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * @returns UserSummaryEntity Get list successfully
   * @throws ApiError
   */
  public static usersControllerGetListUser(): CancelablePromise<
    Array<UserSummaryEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/list',
    });
  }
  /**
   * @returns UserSummaryEntity Get list approver successfully
   * @throws ApiError
   */
  public static usersControllerGetListUserHaveApprovePermission(): CancelablePromise<
    Array<UserSummaryEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/listApprover',
    });
  }
  /**
   * Get user by ID
   * @returns UserEntity User found
   * @throws ApiError
   */
  public static usersControllerFindOne({
    id,
  }: {
    id: string;
  }): CancelablePromise<UserEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{id}',
      path: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
        404: `User not found`,
      },
    });
  }
  /**
   * Update user
   * @returns UserEntity User updated successfully
   * @throws ApiError
   */
  public static usersControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: UpdateUserDto;
  }): CancelablePromise<UserEntity> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/users/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
        404: `User not found`,
      },
    });
  }
  /**
   * Delete user (hard delete)
   * @returns any User deleted successfully
   * @throws ApiError
   */
  public static usersControllerRemove({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/users/{id}',
      path: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
        404: `User not found`,
      },
    });
  }
  /**
   * Get user roles
   * @returns any User roles retrieved successfully
   * @throws ApiError
   */
  public static usersControllerGetUserRoles({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{id}/roles',
      path: {
        id: id,
      },
    });
  }
  /**
   * Get user permissions
   * @returns any User permissions retrieved successfully
   * @throws ApiError
   */
  public static usersControllerGetUserPermissions({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{id}/permissions',
      path: {
        id: id,
      },
    });
  }
}
