/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateUserDto = {
  /**
   * User email address
   */
  email: string;
  /**
   * Username (3-30 characters, alphanumeric and underscore only)
   */
  username: string;
  /**
   * User password (minimum 8 characters, must contain at least one letter and one number)
   */
  password: string;
  /**
   * Disable user login (ログイン不可) - if true, user cannot login
   */
  isActive?: boolean;
  /**
   * Array of permission names to assign to user (権限)
   */
  permissions?: Array<string>;
  /**
   * Company ID to assign user to
   */
  companyId?: string;
};
