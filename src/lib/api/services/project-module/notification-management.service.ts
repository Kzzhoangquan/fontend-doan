// src/lib/api/services/notification-management.service.ts
import api from '../../axios';

export interface NotificationScheme {
  id: number;
  scheme_name: string;
  scheme_description: string | null;
  notifications?: ProjectNotification[];
  projects?: Array<{
    id: number;
    project_name: string;
  }>;
}

export interface ProjectNotification {
  id: number;
  notification_scheme_id: number;
  event_name: string;
  recipient_type: string;
  recipient_value: string | null;
}

export interface EventGroup {
  event_name: string;
  recipients: Array<{
    id: number;
    recipient_type: string;
    recipient_value: string | null;
  }>;
}

export interface CreateNotificationSchemeDto {
  scheme_name: string;
  scheme_description?: string;
}

export interface UpdateNotificationSchemeDto {
  scheme_name?: string;
  scheme_description?: string;
}

export interface CreateNotificationRuleDto {
  notification_scheme_id: number;
  event_name: string;
  recipient_type: string;
  recipient_value?: string | null;
}

export interface BulkAddRecipientsDto {
  notification_scheme_id: number;
  event_name: string;
  recipient_types: string[];
}

export interface BulkRemoveRecipientsDto {
  notification_scheme_id: number;
  event_name: string;
  recipient_types: string[];
}

export interface CloneNotificationSchemeDto {
  source_scheme_id: number;
  new_scheme_name: string;
  new_scheme_description?: string;
}

export interface NotificationStatistics {
  totalSchemes: number;
  totalNotifications: number;
  totalProjects: number;
  notificationsPerScheme: Array<{
    scheme_id: string;
    count: string;
  }>;
  notificationsPerEvent: Array<{
    event_name: string;
    count: string;
  }>;
}

/**
 * Notification Management API Service
 */
export const notificationManagementService = {
  // ============ Notification Schemes ============

  getAllSchemes: async (): Promise<NotificationScheme[]> => {
    const response = await api.get<NotificationScheme[]>('/notification-management/schemes');
    return response.data;
  },

  getSchemeById: async (id: number): Promise<NotificationScheme> => {
    const response = await api.get<NotificationScheme>(`/notification-management/schemes/${id}`);
    return response.data;
  },

  createScheme: async (data: CreateNotificationSchemeDto): Promise<NotificationScheme> => {
    const response = await api.post<NotificationScheme>('/notification-management/schemes', data);
    return response.data;
  },

  updateScheme: async (id: number, data: UpdateNotificationSchemeDto): Promise<NotificationScheme> => {
    const response = await api.patch<NotificationScheme>(`/notification-management/schemes/${id}`, data);
    return response.data;
  },

  deleteScheme: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notification-management/schemes/${id}`);
    return response.data;
  },

  cloneScheme: async (data: CloneNotificationSchemeDto): Promise<NotificationScheme> => {
    const response = await api.post<NotificationScheme>('/notification-management/schemes/clone', data);
    return response.data;
  },

  getSchemeEventsGrouped: async (schemeId: number): Promise<EventGroup[]> => {
    const response = await api.get<EventGroup[]>(`/notification-management/schemes/${schemeId}/events`);
    return response.data;
  },

  // ============ Events & Recipients ============

  getAllAvailableEvents: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/notification-management/events');
    return response.data;
  },

  getAvailableRecipientTypes: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/notification-management/recipient-types');
    return response.data;
  },

  getNotificationsByEvent: async (schemeId: number, eventName: string): Promise<ProjectNotification[]> => {
    const encodedEventName = encodeURIComponent(eventName);
    const response = await api.get<ProjectNotification[]>(
      `/notification-management/schemes/${schemeId}/events/${encodedEventName}`
    );
    return response.data;
  },

  // ============ Notification Rules ============

  createNotificationRule: async (data: CreateNotificationRuleDto): Promise<ProjectNotification> => {
    const response = await api.post<ProjectNotification>('/notification-management/rules', data);
    return response.data;
  },

  deleteNotificationRule: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notification-management/rules/${id}`);
    return response.data;
  },

  bulkAddRecipients: async (data: BulkAddRecipientsDto): Promise<ProjectNotification[]> => {
    const response = await api.post<ProjectNotification[]>('/notification-management/rules/bulk-add', data);
    return response.data;
  },

  bulkRemoveRecipients: async (data: BulkRemoveRecipientsDto): Promise<{ message: string; deleted: number }> => {
    const response = await api.post<{ message: string; deleted: number }>(
      '/notification-management/rules/bulk-remove',
      data
    );
    return response.data;
  },

  // ============ Project Assignments ============

  assignSchemeToProject: async (projectId: number, schemeId: number): Promise<any> => {
    const response = await api.put(`/notification-management/projects/${projectId}/scheme`, {
      notification_scheme_id: schemeId,
    });
    return response.data;
  },

  getProjectsUsingScheme: async (schemeId: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/notification-management/schemes/${schemeId}/projects`);
    return response.data;
  },

  // ============ Statistics ============

  getStatistics: async (): Promise<NotificationStatistics> => {
    const response = await api.get<NotificationStatistics>('/notification-management/statistics');
    return response.data;
  },
};