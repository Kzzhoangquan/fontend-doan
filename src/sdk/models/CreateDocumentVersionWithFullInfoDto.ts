/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateChapterWithSectionsDto } from './CreateChapterWithSectionsDto';
export type CreateDocumentVersionWithFullInfoDto = {
  /**
   * ID of the parent document
   */
  documentId: string;
  /**
   * A list of chapters with full sections for the document version
   */
  chapters: Array<CreateChapterWithSectionsDto>;
  /**
   * Title of version
   */
  title?: string;
};
