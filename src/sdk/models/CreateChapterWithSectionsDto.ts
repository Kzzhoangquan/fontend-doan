/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateChapterDto } from './CreateChapterDto';
import type { CreateSectionDto } from './CreateSectionDto';
export type CreateChapterWithSectionsDto = {
  /**
   * create chapter information
   */
  createChapterDto: CreateChapterDto;
  /**
   * A list of sections for the chapter
   */
  sections: Array<CreateSectionDto>;
};
