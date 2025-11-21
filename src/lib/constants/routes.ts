// src/lib/constants/routes.ts
export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // Dashboard
  DASHBOARD: {
    HOME: '/dashboard',

    // HR Management
    HR: {
      EMPLOYEES: '/dashboard/hr/employees',
      DEPARTMENTS: '/dashboard/hr/departments',
      POSITIONS: '/dashboard/hr/positions',
      ASSETS: '/dashboard/hr/assets',
      ASSET_ASSIGNMENT: '/dashboard/hr/asset-assignment',
      ATTENDANCE: '/dashboard/hr/attendance',
      REQUESTS: '/dashboard/hr/requests',
    },

    // Project Management
    PROJECTS: {
      LIST: '/dashboard/projects',
      ISSUES: '/dashboard/projects/issues',
      SPRINTS: '/dashboard/projects/sprints',
      DETAIL: (id: string) => `/dashboard/projects/${id}`,
    },

    // Accounting
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