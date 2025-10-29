/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserEntity } from './UserEntity';
export type TokenEntity = {
  /**
   * JWT access token
   */
  accessToken: string;
  /**
   * Refresh token
   */
  refreshToken: string;
  /**
   * User information
   */
  user: UserEntity;
};
