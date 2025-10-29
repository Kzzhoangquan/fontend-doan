/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateChapterDto = {
  /**
   * ID of the parent document version
   */
  versionId?: string;
  /**
   * ID of the parent chapter (for nested chapters)
   */
  parentId?: string;
  /**
   * Order of Chapter
   */
  order?: number;
  /**
   * Title of the chapter
   */
  keyCode?: string;
  /**
   * Description of the chapter
   */
  desciption?: string;
};
