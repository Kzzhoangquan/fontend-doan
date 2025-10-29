/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChapterEntity } from '../models/ChapterEntity';
import type { ChapterSummaryEntity } from '../models/ChapterSummaryEntity';
import type { CreateChapterDto } from '../models/CreateChapterDto';
import type { CreateChapterWithSectionsDto } from '../models/CreateChapterWithSectionsDto';
import type { DocumentSummaryEntity } from '../models/DocumentSummaryEntity';
import type { UpdateChapterDto } from '../models/UpdateChapterDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChaptersService {
  /**
   * @returns any
   * @throws ApiError
   */
  public static chaptersControllerFindOne({
    id,
  }: {
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/chapters/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static chaptersControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    /**
     * update information
     */
    requestBody: UpdateChapterDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/chapters/{id}',
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
  public static chaptersControllerDelete({
    id,
  }: {
    /**
     * The ID of the chapter to delete
     */
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/chapters/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static chaptersControllerCreate({
    requestBody,
  }: {
    requestBody: CreateChapterDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/chapters',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static chaptersControllerCreateWithSections({
    requestBody,
  }: {
    requestBody: CreateChapterWithSectionsDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/chapters/createWithSections',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns ChapterSummaryEntity Get list Chapters of Document Version successfully
   * @throws ApiError
   */
  public static chaptersControllerFindListByVersionId({
    versionId,
  }: {
    versionId: string;
  }): CancelablePromise<Array<ChapterSummaryEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/chapters/by-version/{versionId}/list',
      path: {
        versionId: versionId,
      },
    });
  }
  /**
   * @returns ChapterEntity Get all Chapters of Document Version successfully
   * @throws ApiError
   */
  public static chaptersControllerFindAllByVersionId({
    versionId,
  }: {
    versionId: string;
  }): CancelablePromise<Array<ChapterEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/chapters/by-version/{versionId}/all',
      path: {
        versionId: versionId,
      },
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static chaptersControllerUpdateRelatedDocuments({
    id,
    requestBody,
  }: {
    id: string;
    /**
     * List Document
     */
    requestBody: Array<DocumentSummaryEntity>;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/chapters/relatedDocument/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
