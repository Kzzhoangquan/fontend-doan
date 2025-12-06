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
  Briefcase,
  List,
  ArrowRightLeft,
  FileText,
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
    roles: [
      UserRole.MANAGER,
      UserRole.CONTENT_ADMIN,
      UserRole.EMPLOYEE,
      UserRole.ACCOUNTANT,
      UserRole.DEPARTMENT_HEAD,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    label: 'Quản lý',
    icon: Users,
    href: '/dashboard/hr',
    roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.EMPLOYEE],
    children: [
      {
        label: 'Nhân viên',
        icon: Users,
        href: ROUTES.DASHBOARD.HR.EMPLOYEES,
        roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN],
      },
      {
        label: 'Phòng ban',
        icon: Building2,
        href: ROUTES.DASHBOARD.HR.DEPARTMENTS,
        roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN],
      },
      // ✅ TÀI SẢN - CẤP 2 với children cấp 3
      {
        label: 'Vị trí',
        icon: Briefcase,
        href: ROUTES.DASHBOARD.HR.POSITIONS,
        roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN],
      },
      {
        label: 'Tài sản',
        icon: Package,
        href: '/dashboard/hr/assets-management',
        roles: [UserRole.MANAGER],
        children: [
          {
            label: 'Danh sách tài sản',
            icon: List,
            href: ROUTES.DASHBOARD.HR.ASSETS,
            roles: [UserRole.MANAGER],
          },
          {
            label: 'Phân công tài sản',
            icon: ArrowRightLeft,
            href: ROUTES.DASHBOARD.HR.ASSET_ASSIGNMENT,
            roles: [UserRole.MANAGER],
          },
        ],
      },
      {
        label: 'Công ca',
        icon: Calendar,
        href: ROUTES.DASHBOARD.HR.ATTENDANCE,
        roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.EMPLOYEE],
      },
      {
        label: 'Yêu cầu',
        icon: CheckSquare,
        href: ROUTES.DASHBOARD.HR.REQUESTS,
        roles: [UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.EMPLOYEE],
      },
    ],
  },
  // ✅ QUẢN LÝ DỰ ÁN - Không có children, children sẽ được inject động từ API
  {
    label: 'Chấm công',
    icon: Calendar,
    href: ROUTES.DASHBOARD.HR.ATTENDANCE,
    roles: [UserRole.EMPLOYEE],
  },
  {
    label: 'Yêu cầu nghỉ phép',
    icon: CheckSquare,
    href: ROUTES.DASHBOARD.HR.REQUESTS,
    roles: [UserRole.EMPLOYEE],
  },
  {
    label: 'Quản lý dự án',
    icon: FolderKanban,
    href: '/dashboard/projects',
    roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN],
    // Không cần children ở đây, sẽ được inject động trong Sidebar component
  },
  {
    label: 'Kế toán',
    icon: DollarSign,
    href: '/dashboard/accounting',
    roles: [UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN],
    children: [
      {
        label: 'Quản lý lương',
        icon: DollarSign,
        href: ROUTES.DASHBOARD.ACCOUNTING.SALARY,
        roles: [UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN],
      },
      {
        label: 'Báo cáo',
        icon: FileText,
        href: ROUTES.DASHBOARD.ACCOUNTING.REPORTS,
        roles: [UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN],
      },
    ],
  },
  {
    label: 'Tạo yêu cầu cấp tài sản',
    icon: FolderKanban,
    href: ROUTES.DASHBOARD.REQUESTS.REQUESTS,
    roles: [UserRole.EMPLOYEE],
  },
  {
    label: 'Cài đặt',
    icon: Settings,
    href: '/dashboard/settings',
    roles: [
      UserRole.MANAGER,
      UserRole.CONTENT_ADMIN,
      UserRole.EMPLOYEE,
      UserRole.ACCOUNTANT,
      UserRole.DEPARTMENT_HEAD,
      UserRole.SUPER_ADMIN,
    ],
    children: [
      {
        label: 'Thông tin cá nhân',
        icon: Users,
        href: ROUTES.DASHBOARD.SETTINGS.PROFILE,
        roles: [
          UserRole.MANAGER,
          UserRole.CONTENT_ADMIN,
          UserRole.EMPLOYEE,
          UserRole.ACCOUNTANT,
          UserRole.DEPARTMENT_HEAD,
          UserRole.SUPER_ADMIN,
        ],
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