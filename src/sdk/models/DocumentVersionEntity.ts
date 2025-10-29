/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChapterEntity } from './ChapterEntity';
export type DocumentVersionEntity = {
  /**
   * Unique identifier for the document version
   */
  id: string;
  /**
   * ID of the parent document
   */
  documentId: string;
  /**
   * Title of the author
   */
  title?: string | null;
  /**
   * The unique version number of the document
   */
  versionNumber: number;
  /**
   * The status of the document version
   */
  status: string;
  /**
   * Indicates if this is the official version
   */
  isOfficial: boolean;
  /**
   * The author of this version
   */
  authorId?: string | null;
  /**
   * Comments from the author
   */
  authorComment?: string | null;
  /**
   * The approver of this version
   */
  approverId?: string | null;
  /**
   * Comments from the approver
   */
  approvalComment?: string | null;
  /**
   * Timestamp of the approval date
   */
  approvaledAt?: string | null;
  /**
   * Timestamp when the version was created
   */
  createdAt: string;
  /**
   * Timestamp when the version was last updated
   */
  updatedAt: string;
  /**
   * User ID of the person who last modified the version
   */
  modifiedBy?: string | null;
  /**
   * Timestamp when the version was last modified
   */
  modifiedAt?: string | null;
  /**
   * Chapters belonging to this document version
   */
  chapters?: Array<ChapterEntity>;
  /**
   * The parent document
   */
  document?: Record<string, any>;
  /**
   * Chapters belonging to this document version
   */
  author?: Record<string, any>;
  /**
   * Chapters belonging to this document version
   */
  approver?: Record<string, any>;
};
