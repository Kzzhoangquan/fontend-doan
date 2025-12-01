import api from '../../axios';

// ==================== TYPES ====================

export interface ProjectRole {
    id: number;
    role_name: string;
    role_description: string;
    permission_scheme_id: number;
    member_count: number;
    created_at: string;
}

export interface RoleDetail extends ProjectRole {
    permissions: Permission[];
}

export interface Permission {
    id: number;
    action_key: string;
    recipient_type: 'ROLE' | 'EMPLOYEE' | 'REPORTER' | 'ASSIGNEE' | 'GROUP';
    specific_employee_id?: number;
    group_name?: string;
}

export interface CreateRoleDto {
    role_name: string;
    role_description?: string;
}

export interface UpdateRoleDto {
    role_name?: string;
    role_description?: string;
}

export interface AssignPermissionDto {
    action_key: string;
    recipient_type: 'ROLE' | 'EMPLOYEE' | 'REPORTER' | 'ASSIGNEE' | 'GROUP';
    specific_employee_id?: number;
    group_name?: string;
}

export interface BulkAssignPermissionsDto {
    permissions: AssignPermissionDto[];
}

export interface CopyPermissionsDto {
    source_role_id: number;
}

export interface RemovePermissionDto {
    action_key: string;
    recipient_type?: 'ROLE' | 'EMPLOYEE' | 'REPORTER' | 'ASSIGNEE' | 'GROUP';
}

// ==================== SERVICE ====================

export const projectRoleService = {
    // Role CRUD
    getRoles: async (projectId: number): Promise<ProjectRole[]> => {
        const response = await api.get(`/projects/${projectId}/roles`);
        return response.data;
    },

    getRoleDetail: async (projectId: number, roleId: number): Promise<RoleDetail> => {
        const response = await api.get(`/projects/${projectId}/roles/${roleId}`);
        return response.data;
    },

    createRole: async (projectId: number, data: CreateRoleDto): Promise<ProjectRole> => {
        const response = await api.post(`/projects/${projectId}/roles`, data);
        return response.data;
    },

    updateRole: async (
        projectId: number,
        roleId: number,
        data: UpdateRoleDto
    ): Promise<ProjectRole> => {
        const response = await api.put(`/projects/${projectId}/roles/${roleId}`, data);
        return response.data;
    },

    deleteRole: async (projectId: number, roleId: number): Promise<any> => {
        const response = await api.delete(`/projects/${projectId}/roles/${roleId}`);
        return response.data;
    },

    // Permission Management
    getRolePermissions: async (projectId: number, roleId: number): Promise<Permission[]> => {
        const response = await api.get(`/projects/${projectId}/roles/${roleId}/permissions`);
        return response.data;
    },

    assignPermission: async (
        projectId: number,
        roleId: number,
        data: AssignPermissionDto
    ): Promise<Permission> => {
        const response = await api.post(
            `/projects/${projectId}/roles/${roleId}/permissions`,
            data
        );
        return response.data;
    },

    bulkAssignPermissions: async (
        projectId: number,
        roleId: number,
        data: BulkAssignPermissionsDto
    ): Promise<any> => {
        const response = await api.post(
            `/projects/${projectId}/roles/${roleId}/permissions/bulk`,
            data
        );
        return response.data;
    },

    removePermission: async (
        projectId: number,
        roleId: number,
        data: RemovePermissionDto
    ): Promise<any> => {
        const params = new URLSearchParams({
            action_key: data.action_key,
        });
        
        if (data.recipient_type) {
            params.append('recipient_type', data.recipient_type);
        }
        const response = await api.delete(
            `/projects/${projectId}/roles/${roleId}/permissions?${params.toString()}`
        );
        return response.data;
    },

    copyPermissions: async (
        projectId: number,
        targetRoleId: number,
        data: CopyPermissionsDto
    ): Promise<any> => {
        const response = await api.post(
            `/projects/${projectId}/roles/${targetRoleId}/permissions/copy`,
            data
        );
        return response.data;
    },

    clearAllPermissions: async (projectId: number, roleId: number): Promise<any> => {
        const response = await api.delete(
            `/projects/${projectId}/roles/${roleId}/permissions/all`
        );
        return response.data;
    },
};