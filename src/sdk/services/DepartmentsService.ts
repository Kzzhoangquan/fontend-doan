/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDepartmentDto } from '../models/CreateDepartmentDto';
import type { Department } from '../models/Department';
import type { UpdateDepartmentDto } from '../models/UpdateDepartmentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DepartmentsService {
  /**
   * Create a new department
   * @returns Department Department created successfully
   * @throws ApiError
   */
  public static departmentsControllerCreate({
    requestBody,
  }: {
    requestBody: CreateDepartmentDto;
  }): CancelablePromise<Department> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/departments',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request`,
        404: `Company not found`,
      },
    });
  }
  /**
   * Get all departments
   * @returns Department List of departments
   * @throws ApiError
   */
  public static departmentsControllerFindAll(): CancelablePromise<
    Array<Department>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/departments',
    });
  }
  /**
   * Get all departments by company ID
   * @returns Department List of departments for company
   * @throws ApiError
   */
  public static departmentsControllerFindByCompany({
    companyId,
  }: {
    companyId: string;
  }): CancelablePromise<Array<Department>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/departments/company/{companyId}',
      path: {
        companyId: companyId,
      },
    });
  }
  /**
   * Get a department by ID
   * @returns Department Department found
   * @throws ApiError
   */
  public static departmentsControllerFindOne({
    id,
  }: {
    id: string;
  }): CancelablePromise<Department> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/departments/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Department not found`,
      },
    });
  }
  /**
   * Update a department
   * @returns Department Department updated successfully
   * @throws ApiError
   */
  public static departmentsControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: UpdateDepartmentDto;
  }): CancelablePromise<Department> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/departments/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        404: `Department not found`,
      },
    });
  }
  /**
   * Delete a department (soft delete)
   * @returns any Department deleted successfully
   * @throws ApiError
   */
  public static departmentsControllerRemove({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/departments/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Department not found`,
      },
    });
  }
}
