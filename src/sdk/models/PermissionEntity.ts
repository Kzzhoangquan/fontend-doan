/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PermissionEntity = {
  /**
   * Permission ID
   */
  id: string;
  /**
   * Permission name
   */
  name: string;
  /**
   * Permission description
   */
  description?: string;
  /**
   * Resource that permission applies to (e.g., user, role, document)
   */
  resource: string;
  /**
   * Action that can be performed (e.g., create, read, update, delete)
   */
  action: string;
  /**
   * Is permission active
   */
  isActive: boolean;
  /**
   * Created date
   */
  createdAt: string;
  /**
   * Updated date
   */
  updatedAt: string;
  /**
   * Modified by user ID
   */
  modifiedBy?: string;
  /**
   * Modified date
   */
  modifiedAt?: string;
};
