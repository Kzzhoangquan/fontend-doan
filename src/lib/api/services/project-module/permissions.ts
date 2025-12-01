// Permission Actions organized by category

export const PERMISSION_GROUPS = {
    PROJECT_ADMINISTRATION: {
        name: 'Project Administration',
        permissions: [
            { key: 'administer_project', name: 'Administer Project', description: 'Full administrative access to the project' },
        ],
    },
    ISSUE_OPERATIONS: {
        name: 'Issue Operations',
        permissions: [
            { key: 'create_issue', name: 'Create Issue', description: 'Create new issues' },
            { key: 'edit_issue', name: 'Edit Issue', description: 'Edit issues' },
            { key: 'delete_issue', name: 'Delete Issue', description: 'Delete issues' },
            { key: 'assign_issue', name: 'Assign Issue', description: 'Assign issues to users' },
            { key: 'transition_issue', name: 'Transition Issue', description: 'Move issues between statuses' },
        ],
    },
    ISSUE_DETAILS: {
        name: 'Issue Details',
        permissions: [
            { key: 'edit_issue_description', name: 'Edit Description', description: 'Edit issue descriptions' },
            { key: 'edit_issue_summary', name: 'Edit Summary', description: 'Edit issue summaries' },
            { key: 'edit_issue_priority', name: 'Edit Priority', description: 'Edit issue priorities' },
            { key: 'edit_issue_labels', name: 'Edit Labels', description: 'Edit issue labels' },
        ],
    },
    COMMENTS: {
        name: 'Comments',
        permissions: [
            { key: 'add_comments', name: 'Add Comments', description: 'Add comments to issues' },
            { key: 'edit_all_comments', name: 'Edit All Comments', description: 'Edit any comment' },
            { key: 'edit_own_comments', name: 'Edit Own Comments', description: 'Edit own comments' },
            { key: 'delete_all_comments', name: 'Delete All Comments', description: 'Delete any comment' },
            { key: 'delete_own_comments', name: 'Delete Own Comments', description: 'Delete own comments' },
        ],
    },
    ATTACHMENTS: {
        name: 'Attachments',
        permissions: [
            { key: 'create_attachments', name: 'Create Attachments', description: 'Add attachments to issues' },
            { key: 'delete_all_attachments', name: 'Delete All Attachments', description: 'Delete any attachment' },
            { key: 'delete_own_attachments', name: 'Delete Own Attachments', description: 'Delete own attachments' },
        ],
    },
    WORK_LOGS: {
        name: 'Work Logs',
        permissions: [
            { key: 'work_on_issues', name: 'Work on Issues', description: 'Log work on issues' },
            { key: 'edit_all_worklogs', name: 'Edit All Worklogs', description: 'Edit any worklog' },
            { key: 'edit_own_worklogs', name: 'Edit Own Worklogs', description: 'Edit own worklogs' },
            { key: 'delete_all_worklogs', name: 'Delete All Worklogs', description: 'Delete any worklog' },
            { key: 'delete_own_worklogs', name: 'Delete Own Worklogs', description: 'Delete own worklogs' },
        ],
    },
    ISSUE_LINKS: {
        name: 'Issue Links',
        permissions: [
            { key: 'link_issues', name: 'Link Issues', description: 'Create links between issues' },
        ],
    },
    SPRINT_EPIC: {
        name: 'Sprint & Epic',
        permissions: [
            { key: 'manage_sprints', name: 'Manage Sprints', description: 'Create and manage sprints' },
            { key: 'manage_epics', name: 'Manage Epics', description: 'Create and manage epics' },
        ],
    },
    PROJECT_VIEW: {
        name: 'Project View',
        permissions: [
            { key: 'view_project', name: 'View Project', description: 'View project details' },
            { key: 'browse_project', name: 'Browse Project', description: 'Browse project issues' },
            { key: 'view_dev_tools', name: 'View Development Tools', description: 'View development tools' },
            { key: 'view_voters_watchers', name: 'View Voters & Watchers', description: 'View who is watching/voted' },
            { key: 'manage_watchers', name: 'Manage Watchers', description: 'Add/remove watchers' },
        ],
    },
    WORKFLOW: {
        name: 'Workflow',
        permissions: [
            { key: 'view_workflow', name: 'View Workflow', description: 'View workflow configuration' },
            { key: 'edit_workflow', name: 'Edit Workflow', description: 'Edit workflow configuration' },
        ],
    },
};

export const RECIPIENT_TYPES = [
    { value: 'ROLE', label: 'Role', description: 'All users with this role' },
    { value: 'EMPLOYEE', label: 'Specific Employee', description: 'Specific employee only' },
    { value: 'REPORTER', label: 'Reporter', description: 'User who reported the issue' },
    { value: 'ASSIGNEE', label: 'Assignee', description: 'User assigned to the issue' },
    { value: 'GROUP', label: 'Group', description: 'User group' },
];

// Flatten all permissions for easy access
export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS)
    .flatMap(group => group.permissions);

export const getPermissionName = (key: string): string => {
    const permission = ALL_PERMISSIONS.find(p => p.key === key);
    return permission?.name || key;
};

export const getPermissionDescription = (key: string): string => {
    const permission = ALL_PERMISSIONS.find(p => p.key === key);
    return permission?.description || '';
};