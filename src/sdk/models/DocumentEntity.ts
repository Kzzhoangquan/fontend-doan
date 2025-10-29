/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentVersionEntity } from './DocumentVersionEntity';
export type DocumentEntity = {
  /**
   * Document ID
   */
  id: string;
  /**
   * Document key Code
   */
  keyCode: string;
  /**
   * Document name
   */
  name: string;
  /**
   * Document url
   */
  path: string;
  /**
   * Document description
   */
  description?: string | null;
  /**
   * Last modification timestamp
   */
  storagePeriod?: string | null;
  /**
   * Last modification timestamp
   */
  storageLocation?: string | null;
  /**
   * Creation timestamp
   */
  createdAt: string;
  /**
   * Last update timestamp
   */
  updatedAt: string;
  /**
   * User who last modified the record
   */
  modifiedBy?: string | null;
  /**
   * Last modification timestamp
   */
  modifiedAt?: string | null;
  /**
   * Related chapters
   */
  relatedChapters?: string | null;
  /**
   * Document versions
   */
  documentVersions?: Array<DocumentVersionEntity>;
};
