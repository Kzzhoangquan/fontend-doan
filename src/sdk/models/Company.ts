/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Company = {
  /**
   * Company ID
   */
  id: string;
  /**
   * Company name
   */
  name: string;
  /**
   * Industry/field of business
   */
  industry?: string;
  /**
   * Company homepage URL
   */
  homepage?: string;
  /**
   * Total number of employees
   */
  employeeCount?: number;
  /**
   * Company address
   */
  address?: string;
  /**
   * Company phone number
   */
  phone?: string;
  /**
   * Company email
   */
  email?: string;
  /**
   * Company description
   */
  description?: string;
  /**
   * Whether the company is active
   */
  isActive: boolean;
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
  modifiedBy?: string;
  /**
   * Last modification timestamp
   */
  modifiedAt?: string;
  /**
   * Company departments
   */
  departments?: Array<string>;
  /**
   * Company users
   */
  users?: Array<string>;
};
