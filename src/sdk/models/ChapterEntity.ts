/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentSummaryEntity } from './DocumentSummaryEntity';
import type { SectionEntity } from './SectionEntity';
export type ChapterEntity = {
  /**
   * Unique identifier for the chapter
   */
  id: string;
  /**
   * ID of the parent document version
   */
  versionId: string;
  /**
   * ID of the parent chapter (for nested chapters)
   */
  parentId?: string | null;
  /**
   * Key Code of the chapter
   */
  keyCode: string;
  /**
   * Order of chapter
   */
  order: number;
  /**
   * Timestamp when the chapter was created
   */
  createdAt: string;
  /**
   * Timestamp when the chapter was last updated
   */
  updatedAt: string;
  /**
   * User ID of the person who last modified the chapter
   */
  modifiedBy?: string | null;
  /**
   * Timestamp when the chapter was last modified
   */
  modifiedAt?: string | null;
  /**
   * List of related documents
   */
  relatedDocuments: Array<DocumentSummaryEntity>;
  /**
   * Sections contained within this chapter
   */
  sections: Array<SectionEntity>;
  /**
   * The document version this chapter belongs to
   */
  documentVersion?: Record<string, any> | null;
  /**
   * The parent chapter in the hierarchy
   */
  chapterParent?: ChapterEntity | null;
  /**
   * A list of child chapters in the hierarchy
   */
  subChapters: Array<ChapterEntity>;
};
