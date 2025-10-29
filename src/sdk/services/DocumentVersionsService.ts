/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproveDocumentVersionDto } from '../models/ApproveDocumentVersionDto';
import type { CreateDocumentVersionWithFullInfoDto } from '../models/CreateDocumentVersionWithFullInfoDto';
import type { DocumentVersionEntity } from '../models/DocumentVersionEntity';
import type { DocumentVersionSummaryEntity } from '../models/DocumentVersionSummaryEntity';
import type { UpdateDocumentVersionDto } from '../models/UpdateDocumentVersionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentVersionsService {
  /**
   * @returns any
   * @throws ApiError
   */
  public static documentVersionsControllerCreate({
    requestBody,
  }: {
    requestBody: {
      documentId: string;
    };
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/document-versions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static documentVersionsControllerCreateWithFullInfo({
    requestBody,
  }: {
    requestBody: CreateDocumentVersionWithFullInfoDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/document-versions/createWithFullInfo',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns DocumentVersionEntity Get verison successfully
   * @throws ApiError
   */
  public static documentVersionsControllerFindOne({
    documentId,
    version,
  }: {
    documentId: string;
    /**
     * Lấy một phiên bản cụ thể của tài liệu. Nếu bỏ trống, sẽ lấy phiên bản mới nhất.
     */
    version?: number;
  }): CancelablePromise<DocumentVersionEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/document-versions/by-document/{documentId}',
      path: {
        documentId: documentId,
      },
      query: {
        version: version,
      },
    });
  }
  /**
   * @returns DocumentVersionEntity Get draft Version of Document successfully
   * @throws ApiError
   */
  public static documentVersionsControllerFindDraft({
    documentId,
  }: {
    documentId: string;
  }): CancelablePromise<DocumentVersionEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/document-versions/by-document/{documentId}/draft-version',
      path: {
        documentId: documentId,
      },
    });
  }
  /**
   * @returns DocumentVersionSummaryEntity Get List Version of Document successfully
   * @throws ApiError
   */
  public static documentVersionsControllerFindListByDocument({
    documentId,
  }: {
    documentId: string;
  }): CancelablePromise<Array<DocumentVersionSummaryEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/document-versions/by-document/{documentId}/list-version',
      path: {
        documentId: documentId,
      },
    });
  }
  /**
   * @returns DocumentVersionEntity Get List Version of Document successfully
   * @throws ApiError
   */
  public static documentVersionsControllerFindAllByDocument({
    documentId,
  }: {
    documentId: string;
  }): CancelablePromise<Array<DocumentVersionEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/document-versions/by-document/{documentId}/all-version',
      path: {
        documentId: documentId,
      },
    });
  }
  /**
   * @returns DocumentVersionEntity Document version approved successfully
   * @throws ApiError
   */
  public static documentVersionsControllerApprove({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: ApproveDocumentVersionDto;
  }): CancelablePromise<DocumentVersionEntity> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/document-versions/{id}/approve',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden - Insufficient permissions`,
      },
    });
  }
  /**
   * @returns DocumentVersionEntity Update approval Infomation successfully
   * @throws ApiError
   */
  public static documentVersionsControllerUpdateApproveInfo({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: ApproveDocumentVersionDto;
  }): CancelablePromise<DocumentVersionEntity> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/document-versions/{id}/updateApproveInfo',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static documentVersionsControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    /**
     * update information for document version
     */
    requestBody: UpdateDocumentVersionDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/document-versions/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
