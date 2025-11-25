// src/lib/api/services/board.service.ts
import api from '../axios';

export interface BoardIssue {
  id: number;
  issueId: string;
  name: string;
  summary: string;
  issue_code: string;
  issue_type?: {
    type_name: string;
  };
  story_points?: number | null;
  assignees?: Array<{
    full_name: string;
  }>;
}

export interface BoardColumn {
  columnId: string;
  title: string;
  items: BoardIssue[];
}

export interface BoardData {
  columnMap: { [key: string]: BoardColumn };
  orderedColumnIds: string[];
}

export interface ReorderColumnsDto {
  orderedColumnIds: number[];
}

export interface ReorderCardsDto {
  orderedIssueIds: number[];
}

export interface MoveCardDto {
  targetStatusId: number;
  targetIndex: number;
}

/**
 * Board (Kanban) API Service
 * Quản lý board, columns, và card operations
 */
export const boardService = {
  /**
   * Lấy board data theo workflow
   * GET /issues/workflow/:workflowId/statuses
   */
  getBoardByWorkflow: async (workflowId: number): Promise<any> => {
    const response = await api.get<any>(
      `/issues/workflow/${workflowId}/statuses`
    );
    return response.data;
  },

  /**
   * Reorder columns trong workflow
   * PATCH /issues/workflow/:workflowId/columns/reorder
   */
  reorderColumns: async (
    workflowId: number,
    data: ReorderColumnsDto
  ): Promise<any> => {
    const response = await api.patch(
      `/issues/workflow/${workflowId}/columns/reorder`,
      data
    );
    return response.data;
  },

  /**
   * Reorder cards trong cùng 1 column
   * PATCH /issues/status/:statusId/cards/reorder
   */
  reorderCards: async (
    statusId: number,
    data: ReorderCardsDto
  ): Promise<any> => {
    const response = await api.patch(
      `/issues/status/${statusId}/cards/reorder`,
      data
    );
    return response.data;
  },

  /**
   * Move card sang column khác
   * PATCH /issues/card/:issueId/move
   */
  moveCard: async (issueId: number, data: MoveCardDto): Promise<any> => {
    const response = await api.patch(`/issues/card/${issueId}/move`, data);
    return response.data;
  },
};