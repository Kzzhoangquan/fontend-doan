/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApproveDocumentVersionDto = {
  /**
   * ID of the author
   */
  authorId: string;
  /**
   * ID of the approver
   */
  approverId: string;
  /**
   * Comments from the author
   */
  authorComment?: string;
  /**
   * Comments from the approver
   */
  approverComment?: string;
  /**
   * Timestamp of the approval date
   */
  createdAt?: string;
  /**
   * Timestamp of the approval date
   */
  approvaledAt?: string;
  /**
   * Timestamp of the approval date
   */
  versionNumber?: number;
};
