/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportTableDto } from '../models/ExportTableDto';
import type { GeneratePdfDto } from '../models/GeneratePdfDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PdfService {
  /**
   * @returns any
   * @throws ApiError
   */
  public static pdfControllerGeneratePdf({
    requestBody,
  }: {
    requestBody: GeneratePdfDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/pdf/generate',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static pdfControllerExportTable({
    requestBody,
  }: {
    requestBody: ExportTableDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/pdf/export-table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
