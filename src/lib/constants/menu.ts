// src/lib/constants/menu.ts
import { UserRole } from './roles';
import { ROUTES } from './routes';
import { 
  Users, 
  Building2, 
  Package, 
  Calendar, 
  FolderKanban, 
  DollarSign,
  Settings,
  Home,
  CheckSquare,
} from 'lucide-react';

export interface MenuItem {
  label: string;
  icon: any;
  href: string;
  roles: UserRole[];
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Trang chủ',
    icon: Home,
    href: ROUTES.DASHBOARD.HOME,
    roles: [UserRole.MANAGER, UserRole.CONTENT_ADMIN, UserRole.EMPLOYEE, UserRole.ACCOUNTANT, UserRole.DEPARTMENT_HEAD],
  },
  {
    label: 'Quản lý nhân sự',
    icon: Users,
    href: '/dashboard/hr',
    roles: [UserRole.MANAGER],
    children: [
      {
        label: 'Nhân viên',
        icon: Users,
        href: ROUTES.DASHBOARD.HR.EMPLOYEES,
        roles: [UserRole.MANAGER],
      },
      {
        label: 'Phòng ban',
        icon: Building2,
        href: ROUTES.DASHBOARD.HR.DEPARTMENTS,
        roles: [UserRole.MANAGER],
      },
      {
        label: 'Tài sản',
        icon: Package,
        href: ROUTES.DASHBOARD.HR.ASSETS,
        roles: [UserRole.MANAGER],
      },
      {
        label: 'Phân công tài sản',
        icon: Package,
        href: ROUTES.DASHBOARD.HR.ASSET_ASSIGNMENT,
        roles: [UserRole.MANAGER],
      },
      {
        label: 'Công ca',
        icon: Calendar,
        href: ROUTES.DASHBOARD.HR.ATTENDANCE,
        roles: [UserRole.MANAGER],
      },
      {
        label: 'Yêu cầu',
        icon: CheckSquare,
        href: ROUTES.DASHBOARD.HR.REQUESTS,
        roles: [UserRole.MANAGER],
      },
    ],
  },
  {
    label: 'Quản lý dự án',
    icon: FolderKanban,
    href: '/dashboard/projects',
    roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD],
    children: [
      {
        label: 'Dự án',
        icon: FolderKanban,
        href: ROUTES.DASHBOARD.PROJECTS.LIST,
        roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD],
      },
      {
        label: 'Issues',
        icon: CheckSquare,
        href: ROUTES.DASHBOARD.PROJECTS.ISSUES,
        roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD],
      },
      {
        label: 'Sprints',
        icon: Calendar,
        href: ROUTES.DASHBOARD.PROJECTS.SPRINTS,
        roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD],
      },
    ],
  },
  {
    label: 'Kế toán',
    icon: DollarSign,
    href: '/dashboard/accounting',
    roles: [UserRole.ACCOUNTANT],
    children: [
      {
        label: 'Quản lý lương',
        icon: DollarSign,
        href: ROUTES.DASHBOARD.ACCOUNTING.SALARY,
        roles: [UserRole.ACCOUNTANT],
      },
      {
        label: 'Báo cáo',
        icon: CheckSquare,
        href: ROUTES.DASHBOARD.ACCOUNTING.REPORTS,
        roles: [UserRole.ACCOUNTANT],
      },
    ],
  },
  {
    label: 'Cài đặt',
    icon: Settings,
    href: '/dashboard/settings',
    roles: [UserRole.MANAGER, UserRole.CONTENT_ADMIN, UserRole.EMPLOYEE, UserRole.ACCOUNTANT, UserRole.DEPARTMENT_HEAD],
    children: [
      {
        label: 'Thông tin cá nhân',
        icon: Users,
        href: ROUTES.DASHBOARD.SETTINGS.PROFILE,
        roles: [UserRole.MANAGER, UserRole.CONTENT_ADMIN, UserRole.EMPLOYEE, UserRole.ACCOUNTANT, UserRole.DEPARTMENT_HEAD],
      },
      {
        label: 'Phân quyền',
        icon: Settings,
        href: ROUTES.DASHBOARD.SETTINGS.PERMISSIONS,
        roles: [UserRole.CONTENT_ADMIN],
      },
    ],
  },
];