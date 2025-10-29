/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserEntity = {
  /**
   * Creation date
   */
  createdAt: string;
  /**
   * Last update date
   */
  updatedAt: string;
  /**
   * Modified by user ID
   */
  modifiedBy?: string | null;
  /**
   * Last modification date
   */
  modifiedAt?: string | null;
  /**
   * User ID
   */
  id: string;
  /**
   * User email
   */
  email: string;
  /**
   * Username
   */
  username: string;
  /**
   * Company ID
   */
  companyId?: string | null;
  /**
   * Is user active
   */
  isActive: boolean;
  /**
   * Is user verified
   */
  isVerified: boolean;
  /**
   * Last login date
   */
  lastLoginAt?: string | null;
  /**
   * Company
   */
  company?: Record<string, any> | null;
  /**
   * User roles
   */
  userRoles?: Array<string>;
  /**
   * User permissions
   */
  userPermissions?: Array<string>;
  /**
   * User all permissions
   */
  allPermissions?: Array<string>;
};
