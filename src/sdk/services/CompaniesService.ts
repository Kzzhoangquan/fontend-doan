/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { CreateCompanyDto } from '../models/CreateCompanyDto';
import type { UpdateCompanyDto } from '../models/UpdateCompanyDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompaniesService {
  /**
   * Create a new company
   * @returns Company Company created successfully
   * @throws ApiError
   */
  public static companiesControllerCreate({
    requestBody,
  }: {
    requestBody: CreateCompanyDto;
  }): CancelablePromise<Company> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/companies',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad request`,
      },
    });
  }
  /**
   * Get all companies
   * @returns Company List of companies
   * @throws ApiError
   */
  public static companiesControllerFindAll(): CancelablePromise<
    Array<Company>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/companies',
    });
  }
  /**
   * Get a company by ID
   * @returns Company Company found
   * @throws ApiError
   */
  public static companiesControllerFindOne({
    id,
  }: {
    id: string;
  }): CancelablePromise<Company> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/companies/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Company not found`,
      },
    });
  }
  /**
   * Update a company
   * @returns Company Company updated successfully
   * @throws ApiError
   */
  public static companiesControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: UpdateCompanyDto;
  }): CancelablePromise<Company> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/companies/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        404: `Company not found`,
      },
    });
  }
  /**
   * Delete a company (soft delete)
   * @returns any Company deleted successfully
   * @throws ApiError
   */
  public static companiesControllerRemove({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/companies/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `Company not found`,
      },
    });
  }
}
