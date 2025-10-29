/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateDocumentVersionDto = {
  /**
   * ID of the parent document
   */
  documentId?: string;
  /**
   * Title of version
   */
  title?: string;
  /**
   * The unique version number of the document
   */
  versionNumber?: number;
  /**
   * The status of the document version
   */
  status?: string;
  /**
   * Indicates if this is the official version
   */
  isOfficial?: boolean;
  /**
   * The author of this version
   */
  author?: string;
  /**
   * Comments from the author
   */
  authorComment?: string;
  /**
   * The approver of this version
   */
  approver?: string;
  /**
   * Comments from the approver
   */
  approvaledComment?: string;
  /**
   * Timestamp of the approval date
   */
  approvaled?: string;
};
