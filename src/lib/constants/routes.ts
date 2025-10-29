export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    
    // HR Routes
    HR: {
      EMPLOYEES: '/dashboard/hr/employees',
      DEPARTMENTS: '/dashboard/hr/departments',
      ASSETS: '/dashboard/hr/assets',
      ASSET_ASSIGNMENT: '/dashboard/hr/asset-assignment',
      ATTENDANCE: '/dashboard/hr/attendance',
      REQUESTS: '/dashboard/hr/requests',
    },
    
    // Project Routes
    PROJECTS: {
      LIST: '/dashboard/projects/list',
      DETAIL: (id: string) => `/dashboard/projects/${id}`,
      ISSUES: '/dashboard/projects/issues',
      SPRINTS: '/dashboard/projects/sprints',
    },
    
    // Accounting Routes
    ACCOUNTING: {
      SALARY: '/dashboard/accounting/salary',
      REPORTS: '/dashboard/accounting/reports',
    },
    
    // Settings
    SETTINGS: {
      PROFILE: '/dashboard/settings/profile',
      PERMISSIONS: '/dashboard/settings/permissions',
    },
  },
} as const;