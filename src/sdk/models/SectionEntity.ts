/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SectionEntity = {
  /**
   * Unique identifier for the section
   */
  id: string;
  /**
   * ID of the parent chapter
   */
  chapterId: string;
  /**
   * Optional title of the section
   */
  keyCode?: string | null;
  /**
   * The type of content in the section (e.g., text, table, tiptap)
   */
  type: string;
  /**
   * The content of the section, stored as JSONB
   */
  content?: Record<string, any>;
  /**
   * The order of section
   */
  order: number;
  /**
   * Timestamp when the section was created
   */
  createdAt: string;
  /**
   * Timestamp when the section was last updated
   */
  updatedAt: string;
  /**
   * User ID of the person who last modified the section
   */
  modifiedBy?: string | null;
  /**
   * Timestamp when the section was last modified
   */
  modifiedAt?: string | null;
};
