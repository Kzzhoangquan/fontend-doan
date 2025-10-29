/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentEntity } from '../models/DocumentEntity';
import type { DocumentSummaryEntity } from '../models/DocumentSummaryEntity';
import type { UpdateDocumentDto } from '../models/UpdateDocumentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
  /**
   * @returns DocumentEntity Get all Sections of Chapter successfully
   * @throws ApiError
   */
  public static documentsControllerFindByPath({
    path,
  }: {
    path: string;
  }): CancelablePromise<DocumentEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/documents/by-path/{path}',
      path: {
        path: path,
      },
    });
  }
  /**
   * @returns DocumentSummaryEntity Get list Documents
   * @throws ApiError
   */
  public static documentsControllerFindList(): CancelablePromise<
    Array<DocumentSummaryEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/documents/list',
    });
  }
  /**
   * @returns DocumentEntity Get All Documents
   * @throws ApiError
   */
  public static documentsControllerFindAll(): CancelablePromise<
    Array<DocumentEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/documents/all',
    });
  }
  /**
   * @returns DocumentEntity Update document successfully
   * @throws ApiError
   */
  public static documentsControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: UpdateDocumentDto;
  }): CancelablePromise<DocumentEntity> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/documents/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
