/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSectionDto } from '../models/CreateSectionDto';
import type { SectionEntity } from '../models/SectionEntity';
import type { UpdateSectionDto } from '../models/UpdateSectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SectionsService {
  /**
   * @returns any
   * @throws ApiError
   */
  public static sectionsControllerCreate({
    requestBody,
  }: {
    requestBody: CreateSectionDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/sections',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns any
   * @throws ApiError
   */
  public static sectionsControllerUpdate({
    id,
    requestBody,
  }: {
    id: string;
    requestBody: UpdateSectionDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/v1/sections/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns SectionEntity Get all Sections of Chapter successfully
   * @throws ApiError
   */
  public static sectionsControllerFindAllByChapteerId({
    chapterId,
  }: {
    chapterId: string;
  }): CancelablePromise<Array<SectionEntity>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/sections/by-chapter/{chapterId}',
      path: {
        chapterId: chapterId,
      },
    });
  }
}
