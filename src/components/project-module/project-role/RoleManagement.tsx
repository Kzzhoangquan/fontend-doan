import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Popconfirm,
    message,
    Tag,
    Card,
    Modal,
    Select,
    Alert,
    Tooltip,
    Statistic,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    KeyOutlined,
    CopyOutlined,
    ClearOutlined,
    TeamOutlined,
    SafetyOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ProjectRole } from '@/lib/api/services/project-module/project-role.service';
import { projectRoleService, RoleDetail } from '@/lib/api/services/project-module/project-role.service';
import { RoleModal } from './RoleModal';
import { AssignPermissionsModal } from './AssignPermissionsModal';
import { getPermissionName } from '@/lib/api/services/project-module/permissions';

const { Option } = Select;

interface RoleManagementProps {
    projectId: number;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ projectId }) => {
    const [roles, setRoles] = useState<ProjectRole[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<ProjectRole | null>(null);
    const [selectedRoleForPermission, setSelectedRoleForPermission] = useState<RoleDetail | null>(
        null
    );
    const [sourceRoleId, setSourceRoleId] = useState<number | null>(null);

    useEffect(() => {
        loadRoles();
    }, [projectId]);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const data = await projectRoleService.getRoles(projectId);
            setRoles(data);
        } catch (error: any) {
            message.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setIsRoleModalVisible(true);
    };

    const handleEditRole = (role: ProjectRole) => {
        setEditingRole(role);
        setIsRoleModalVisible(true);
    };

    const handleRoleSubmit = async (values: any) => {
        if (editingRole) {
            await projectRoleService.updateRole(projectId, editingRole.id, values);
        } else {
            await projectRoleService.createRole(projectId, values);
        }
        await loadRoles();
        setIsRoleModalVisible(false);
    };

    const handleDeleteRole = async (role: ProjectRole) => {
        try {
            await projectRoleService.deleteRole(projectId, role.id);
            message.success(`Role "${role.role_name}" deleted successfully`);
            await loadRoles();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const handleManagePermissions = async (role: ProjectRole) => {
        try {
            setLoading(true);
            const roleDetail = await projectRoleService.getRoleDetail(projectId, role.id);
            setSelectedRoleForPermission(roleDetail);
            setIsPermissionModalVisible(true);
        } catch (error: any) {
            message.error('Failed to load role details');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignPermissions = async (permissions: any[]) => {
        if (!selectedRoleForPermission) return;

        await projectRoleService.bulkAssignPermissions(projectId, selectedRoleForPermission.id, {
            permissions,
        });

        // Reload role detail
        const updated = await projectRoleService.getRoleDetail(
            projectId,
            selectedRoleForPermission.id
        );
        setSelectedRoleForPermission(updated);
        await loadRoles();
    };

    // ✅ NEW: Handler for removing permission
    const handleRemovePermission = async (actionKey: string) => {
        if (!selectedRoleForPermission) return;

        await projectRoleService.removePermission(projectId, selectedRoleForPermission.id, {
            action_key: actionKey,
            recipient_type: 'ROLE',
        });

        // Reload role detail
        const updated = await projectRoleService.getRoleDetail(
            projectId,
            selectedRoleForPermission.id
        );
        setSelectedRoleForPermission(updated);
        await loadRoles();
    };

    const handleClearPermissions = (role: ProjectRole) => {
        Modal.confirm({
            title: `Clear All Permissions for "${role.role_name}"?`,
            icon: <ExclamationCircleOutlined />,
            content:
                'This will remove all permissions from this role. Members with this role will lose their current permissions.',
            okText: 'Clear All',
            okType: 'danger',
            async onOk() {
                try {
                    await projectRoleService.clearAllPermissions(projectId, role.id);
                    message.success('All permissions cleared successfully');
                    await loadRoles();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Failed to clear permissions');
                }
            },
        });
    };


    const isDefaultRole = (roleName: string) => {
        return ['Administrator', 'Member', 'Viewer'].includes(roleName);
    };

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (name: string) => (
                <Space>
                    <SafetyOutlined />
                    <strong>{name}</strong>
                    {isDefaultRole(name) && <Tag color="gold">Default</Tag>}
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'role_description',
            key: 'role_description',
            ellipsis: true,
        },
        {
            title: 'Members',
            dataIndex: 'member_count',
            key: 'member_count',
            width: 120,
            align: 'center' as const,
            render: (count: number) => (
                <Space>
                    <TeamOutlined />
                    <span>{count}</span>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_: any, role: ProjectRole) => (
                <Space size="small">

                    <Tooltip title="Manage Permissions">
                        <Button
                            size="small"
                            type="primary"
                            icon={<KeyOutlined />}
                            onClick={() => handleManagePermissions(role)}
                        >
                            Manage
                        </Button>
                    </Tooltip>

                    <Tooltip title="Edit Role">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditRole(role)}
                        />
                    </Tooltip>

                    {!isDefaultRole(role.role_name) && (
                        <>
                            <Tooltip title="Clear All Permissions">
                                <Popconfirm
                                    title="Clear all permissions?"
                                    onConfirm={() => handleClearPermissions(role)}
                                    okText="Clear"
                                    cancelText="Cancel"
                                >
                                    <Button size="small" danger icon={<ClearOutlined />} />
                                </Popconfirm>
                            </Tooltip>

                            <Tooltip title="Delete Role">
                                <Popconfirm
                                    title={`Delete role "${role.role_name}"?`}
                                    description={
                                        role.member_count > 0
                                            ? `This role has ${role.member_count} members. Please reassign them first.`
                                            : 'This action cannot be undone.'
                                    }
                                    onConfirm={() => handleDeleteRole(role)}
                                    okText="Delete"
                                    okType="danger"
                                    cancelText="Cancel"
                                    disabled={role.member_count > 0}
                                >
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        disabled={role.member_count > 0}
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}

                    {isDefaultRole(role.role_name) && (
                        <Tooltip title="Cannot delete default roles">
                            <Button size="small" danger icon={<DeleteOutlined />} disabled />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const totalMembers = roles.reduce((sum, role) => sum + role.member_count, 0);
    const customRolesCount = roles.filter((r) => !isDefaultRole(r.role_name)).length;

    return (
        <div>
            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Roles"
                            value={roles.length}
                            prefix={<SafetyOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Custom Roles"
                            value={customRolesCount}
                            prefix={<SafetyOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Members"
                            value={totalMembers}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Actions */}
            <Card
                title={
                    <Space>
                        <SafetyOutlined />
                        <span>Project Roles & Permissions</span>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRole}>
                        Create Role
                    </Button>
                }
            >
                <Alert
                    message="Role-Based Access Control"
                    description="Manage roles and their permissions for this project. Default roles (Administrator, Member, Viewer) cannot be deleted but can have their permissions customized."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

            {/* Role Modal */}
            <RoleModal
                visible={isRoleModalVisible}
                onCancel={() => setIsRoleModalVisible(false)}
                onSuccess={() => {
                    setIsRoleModalVisible(false);
                    loadRoles();
                }}
                projectId={projectId}
                role={editingRole}
                onSubmit={handleRoleSubmit}
            />

            {/* Assign Permissions Modal */}
            {selectedRoleForPermission && (
                <AssignPermissionsModal
                    visible={isPermissionModalVisible}
                    onCancel={() => setIsPermissionModalVisible(false)}
                    onSuccess={() => {
                        setIsPermissionModalVisible(false);
                        loadRoles();
                    }}
                    roleName={selectedRoleForPermission.role_name}
                    existingPermissions={selectedRoleForPermission.permissions}
                    onSubmit={handleAssignPermissions}
                    onRemove={handleRemovePermission} // ✅ Pass remove handler
                />
            )}
        </div>
    );
};