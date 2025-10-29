/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
  /**
   * Get API information
   * @returns any API information retrieved successfully
   * @throws ApiError
   */
  public static appControllerGetApiInfo(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1',
    });
  }
  /**
   * Health check endpoint
   * @returns any Service is healthy
   * @throws ApiError
   */
  public static appControllerGetHealth(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/health',
    });
  }
  /**
   * Get API version information
   * @returns any Version information retrieved successfully
   * @throws ApiError
   */
  public static appControllerGetVersion(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/version',
    });
  }
}
