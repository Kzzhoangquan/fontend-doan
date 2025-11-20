// Common types for Sprint components

export type Issue = {
    id: number;
    issue_code: string;
    summary: string;
    story_points: number | null;
    issue_type?: {
        type_name: string;
    };
    assignees?: Array<{
        full_name: string;
    }>;
    rank_order?: number;
};

export type Sprint = {
    id: number;
    project_id: number;
    sprint_name: string;
    goal: string | null;
    start_date: string | null;
    end_date: string | null;
    duration_days: number | null;
    status: string;
    issue_count?: number;
};