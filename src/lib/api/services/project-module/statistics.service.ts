// src/lib/api/services/statistics.service.ts
import api from '../../axios';

// ==================== Interfaces ====================

export interface StatusBreakdown {
  status_id: number;
  status_name: string;
  count: number;
  percentage: number;
}

export interface TypeBreakdown {
  issue_type_id: number;
  type_name: string;
  count: number;
  percentage: number;
}

export interface AssigneeBreakdown {
  employee_id: number;
  employee_name: string;
  count: number;
  completed: number;
  in_progress: number;
}

export interface ResolutionStats {
  resolved: number;
  unresolved: number;
  resolution_rate: number;
}

export interface TimeStats {
  total_story_points: number;
  average_story_points: number;
  total_estimated_hours: number;
  total_spent_hours: number;
}

export interface IssueStatistics {
  total_issues: number;
  by_status: StatusBreakdown[];
  by_type: TypeBreakdown[];
  by_assignee: AssigneeBreakdown[];
  resolution_stats: ResolutionStats;
  time_stats: TimeStats;
}

export interface EpicStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface EpicCompletionStats {
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
}

export interface EpicIssueDistribution {
  epic_id: number;
  epic_name: string;
  total_issues: number;
  completed_issues: number;
  progress_percentage: number;
}

export interface EpicTimelineStats {
  on_track: number;
  at_risk: number;
  overdue: number;
  average_duration_days: number;
}

export interface EpicStatistics {
  total_epics: number;
  by_status: EpicStatusBreakdown[];
  completion_stats: EpicCompletionStats;
  issue_distribution: EpicIssueDistribution[];
  timeline_stats: EpicTimelineStats;
}

export interface SprintStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface VelocityTrend {
  sprint_name: string;
  completed_story_points: number;
  committed_story_points: number;
}

export interface VelocityStats {
  average_velocity: number;
  last_sprint_velocity: number;
  velocity_trend: VelocityTrend[];
}

export interface SprintPerformance {
  sprint_id: number;
  sprint_name: string;
  total_issues: number;
  completed_issues: number;
  completion_rate: number;
  total_story_points: number;
  completed_story_points: number;
  start_date?: string;
  end_date?: string;
}

export interface SprintStatistics {
  total_sprints: number;
  by_status: SprintStatusBreakdown[];
  velocity_stats: VelocityStats;
  sprint_performance: SprintPerformance[];
}

export interface TopContributor {
  employee_id: number;
  employee_name: string;
  issues_completed: number;
  issues_assigned: number;
}

export interface TeamStatistics {
  total_members: number;
  active_contributors: number;
  top_contributors: TopContributor[];
}

export interface ProjectOverallStatistics {
  project_id: number;
  project_name: string;
  project_key: string;
  issue_stats: IssueStatistics;
  epic_stats: EpicStatistics;
  sprint_stats: SprintStatistics;
  team_stats: TeamStatistics;
}

export interface TrendData {
  date: string;
  created: number;
  resolved: number;
  cumulative: number;
}

export interface StatisticsQueryParams {
  start_date?: string;
  end_date?: string;
}

// ==================== Service ====================

/**
 * Statistics API Service
 * Provides project statistics and analytics
 */
export const statisticsService = {
  /**
   * Lấy tổng quan thống kê project
   * GET /statistics/projects/:projectId/overview
   */
  getProjectOverview: async (
    projectId: number,
    params?: StatisticsQueryParams
  ): Promise<ProjectOverallStatistics> => {
    const response = await api.get<ProjectOverallStatistics>(
      `/statistics/projects/${projectId}/overview`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy thống kê issues
   * GET /statistics/projects/:projectId/issues
   */
  getIssueStatistics: async (
    projectId: number,
    params?: StatisticsQueryParams
  ): Promise<IssueStatistics> => {
    const response = await api.get<IssueStatistics>(
      `/statistics/projects/${projectId}/issues`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy xu hướng issues theo thời gian
   * GET /statistics/projects/:projectId/issues/trend
   */
  getIssueTrend: async (
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<TrendData[]> => {
    const response = await api.get<TrendData[]>(
      `/statistics/projects/${projectId}/issues/trend`,
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    return response.data;
  },

  /**
   * Lấy thống kê epics
   * GET /statistics/projects/:projectId/epics
   */
  getEpicStatistics: async (
    projectId: number,
    params?: StatisticsQueryParams
  ): Promise<EpicStatistics> => {
    const response = await api.get<EpicStatistics>(
      `/statistics/projects/${projectId}/epics`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy thống kê sprints
   * GET /statistics/projects/:projectId/sprints
   */
  getSprintStatistics: async (
    projectId: number,
    params?: StatisticsQueryParams
  ): Promise<SprintStatistics> => {
    const response = await api.get<SprintStatistics>(
      `/statistics/projects/${projectId}/sprints`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy thống kê team
   * GET /statistics/projects/:projectId/team
   */
  getTeamStatistics: async (projectId: number): Promise<TeamStatistics> => {
    const response = await api.get<TeamStatistics>(
      `/statistics/projects/${projectId}/team`
    );
    return response.data;
  },
};