/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterDto = {
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
   * First name
   */
  firstName?: string;
  /**
   * Last name
   */
  lastName?: string;
  /**
   * Phone number (international format)
   */
  phone?: string;
};
