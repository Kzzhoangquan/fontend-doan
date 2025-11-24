// src/lib/api/services/issue.service.ts
import api from '../axios';

export interface Issue {
  id: number;
  project_id: number;
  issue_type_id: number;
  issue_code: string;
  summary: string;
  description: string | null;
  current_status_id: number;
  reporter_id: number;
  epic_link_id: number | null;
  story_points: number | null;
  original_estimate_seconds: number | null;
  time_spent_seconds: number | null;
  resolution: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  issue_type?: {
    id: number;
    type_name: string;
  };
  current_status?: {
    id: number;
    status_name: string;
  };
  reporter?: {
    id: number;
    full_name: string;
  };
  epic_link?: {
    id: number;
    epic_name: string;
  };
  project?: {
    id: number;
    project_name: string;
  };
  assignees?: Employee[];
  watchers?: Employee[];
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
}

export interface IssueType {
  id: number;
  type_name: string;
}

export interface WorkflowStatus {
  id: number;
  status_name: string;
  status_category: string | null;
}

export interface IssueComment {
  id: number;
  issue_id: number;
  employee_id: number;
  content: string;
  created_at: string;
  employee?: Employee;
}

export interface IssueLink {
  id: number;
  link_type: string;
  issue: {
    id: number;
    issue_code: string;
    summary: string;
    issue_type?: string;
    current_status_id: number;
  };
}

export interface IssueLinksData {
  outgoing: IssueLink[];
  incoming: IssueLink[];
}

export interface IssueChangeHistory {
  id: number;
  issue_id: number;
  changer_employee_id: number;
  change_date: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changer_employee?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateIssueDto {
  project_id: number;
  issue_type_id: number;
  issue_code: string;
  summary: string;
  current_status_id: number;
  reporter_id: number;
  description?: string | null;
  epic_link_id?: number | null;
  story_points?: number | null;
  original_estimate_seconds?: number | null;
  time_spent_seconds?: number | null;
  resolution?: string | null;
}

export interface UpdateIssueDto extends Partial<CreateIssueDto> {}

export interface GetIssuesParams {
  search?: string;
  projectId?: number;
}

/**
 * Issue API Service
 */
export const issueService = {
  // ============ CRUD Operations ============
  
  getAll: async (params?: GetIssuesParams): Promise<Issue[]> => {
    const response = await api.get<Issue[]>('/issues', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Issue> => {
    const response = await api.get<Issue>(`/issues/${id}`);
    return response.data;
  },

  create: async (data: CreateIssueDto): Promise<Issue> => {
    const response = await api.post<Issue>('/issues', data);
    return response.data;
  },

  update: async (id: number, data: UpdateIssueDto): Promise<Issue> => {
    const response = await api.patch<Issue>(`/issues/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },

  // ============ Reference Data ============

  getIssueTypes: async (): Promise<IssueType[]> => {
    const response = await api.get<IssueType[]>('/issues/types');
    return response.data;
  },

  getWorkflowStatuses: async (workflowId: number): Promise<WorkflowStatus[]> => {
    const response = await api.get<WorkflowStatus[]>('/issues/statuses', {
      params: { workflowId },
    });
    return response.data;
  },

  getProjectEmployees: async (projectId: number): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/issues/employees', {
      params: { projectId },
    });
    return response.data;
  },

  // ============ Assignees ============

  getAssignees: async (issueId: number): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/issues/${issueId}/assignees`);
    return response.data;
  },

  assignEmployee: async (issueId: number, employeeId: number): Promise<Issue> => {
    const response = await api.post<Issue>(`/issues/${issueId}/assignees`, {
      employee_id: employeeId,
    });
    return response.data;
  },

  removeAssignee: async (issueId: number, employeeId: number): Promise<Issue> => {
    const response = await api.delete<Issue>(
      `/issues/${issueId}/assignees/${employeeId}`
    );
    return response.data;
  },

  // ============ Watchers ============

  getWatchers: async (issueId: number): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/issues/${issueId}/watchers`);
    return response.data;
  },

  addWatcher: async (issueId: number, employeeId: number): Promise<Issue> => {
    const response = await api.post<Issue>(`/issues/${issueId}/watchers`, {
      employee_id: employeeId,
    });
    return response.data;
  },

  removeWatcher: async (issueId: number, employeeId: number): Promise<Issue> => {
    const response = await api.delete<Issue>(
      `/issues/${issueId}/watchers/${employeeId}`
    );
    return response.data;
  },

  // ============ Comments ============

  getComments: async (issueId: number): Promise<IssueComment[]> => {
    const response = await api.get<IssueComment[]>(`/issues/${issueId}/comments`);
    return response.data;
  },

  createComment: async (
    issueId: number,
    employeeId: number,
    content: string
  ): Promise<IssueComment> => {
    const response = await api.post<IssueComment>(`/issues/${issueId}/comments`, {
      employee_id: employeeId,
      content,
    });
    return response.data;
  },

  updateComment: async (
    issueId: number,
    commentId: number,
    content: string
  ): Promise<IssueComment> => {
    const response = await api.patch<IssueComment>(
      `/issues/${issueId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  },

  deleteComment: async (issueId: number, commentId: number): Promise<void> => {
    await api.delete(`/issues/${issueId}/comments/${commentId}`);
  },

  // ============ Links ============

  getLinks: async (issueId: number): Promise<IssueLinksData> => {
    const response = await api.get<IssueLinksData>(`/issues/${issueId}/links`);
    return response.data;
  },

  createLink: async (
    issueId: number,
    targetIssueId: number,
    linkType: string
  ): Promise<any> => {
    const response = await api.post(`/issues/${issueId}/links`, {
      target_issue_id: targetIssueId,
      link_type: linkType,
    });
    return response.data;
  },

  deleteLink: async (issueId: number, linkId: number): Promise<void> => {
    await api.delete(`/issues/${issueId}/links/${linkId}`);
  },

  // ============ History ============

  getHistory: async (issueId: number): Promise<IssueChangeHistory[]> => {
    const response = await api.get<IssueChangeHistory[]>(`/issues/${issueId}/history`);
    return response.data;
  },

  // ============ Epics ============

  getProjectEpics: async (projectId: number): Promise<any[]> => {
    const response = await api.get<any[]>('/issues/epics', {
      params: { projectId },
    });
    return response.data;
  },
};