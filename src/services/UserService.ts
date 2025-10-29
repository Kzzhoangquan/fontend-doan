import { formatUserName } from '@/lib/util/string';

import { UserEntity } from '@/sdk/models/UserEntity';
import { UsersService } from '@/sdk/services/UsersService';
import { UserPermissionsResponse } from '@/types/user';

// Bạn có thể định nghĩa một kiểu dữ liệu mới để bao gồm tên đã định dạng
export type UserWithDisplayName = UserEntity & { displayName: string };

export class UserService {
  /**
   * Lấy tất cả người dùng và thêm thuộc tính 'displayName' đã được định dạng.
   * Giả sử UserEntity có thuộc tính 'username' cần được định dạng.
   */
  static async getAllUsers(): Promise<UserWithDisplayName[]> {
    const users: UserEntity[] = await UsersService.usersControllerFindAll();

    // 2. Dùng .map() để biến đổi mỗi user và thêm thuộc tính mới
    return users.map(user => ({
      ...user,
      // Tạo thuộc tính mới 'displayName' từ 'username'
      displayName: formatUserName(user.username),
    }));
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const response: UserPermissionsResponse =
        await UsersService.usersControllerGetUserPermissions({
          id: userId,
        });

      const permissions: string[] = [];

      // Handle direct permissions
      if (response.direct && Array.isArray(response.direct)) {
        response.direct.forEach(directPerm => {
          if (directPerm.permission) {
            permissions.push(
              directPerm.permission.name ||
                directPerm.permission.description ||
                'Unknown Permission'
            );
          }
        });
      }

      // Handle role-based permissions
      if (response.roleBased && Array.isArray(response.roleBased)) {
        response.roleBased.forEach(roleBasedPerm => {
          if (
            roleBasedPerm.role &&
            roleBasedPerm.role.rolePermissions &&
            Array.isArray(roleBasedPerm.role.rolePermissions)
          ) {
            roleBasedPerm.role.rolePermissions.forEach(rolePerm => {
              if (rolePerm.permission) {
                permissions.push(
                  rolePerm.permission.name ||
                    rolePerm.permission.description ||
                    'Unknown Permission'
                );
              }
            });
          }
        });
      }

      // Remove duplicates and return
      return [...new Set(permissions)];
    } catch (error) {
      console.error(`Failed to fetch permissions for user ${userId}:`, error);
      return [];
    }
  }
  static async getUserRoles(userId: string): Promise<string[]> {
    try {
      const response = await UsersService.usersControllerGetUserRoles({
        id: userId,
      });

      const roles: string[] = [];

      // Handle roles response
      if (Array.isArray(response)) {
        response.forEach(userRole => {
          if (userRole.role && userRole.role.name) {
            roles.push(userRole.role.name);
          }
        });
      }

      // Remove duplicates and return
      return [...new Set(roles)];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch roles for user ${userId}:`, error);
      return [];
    }
  }
}
