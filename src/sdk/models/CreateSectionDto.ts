/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSectionDto = {
  /**
   * Key Code of the section
   */
  keyCode: string;
  /**
   * Chapter contain the section
   */
  chapterId: string;
  /**
   * The order of Section
   */
  order?: number;
  /**
   * The type of content in the section (e.g., text, table, tiptap)
   */
  type: string;
  /**
   * The content of the section, stored as JSONB
   */
  content: Record<string, any>;
};
