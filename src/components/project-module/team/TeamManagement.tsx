import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Card,
    message,
    Popconfirm,
    Input,
    Select,
    Avatar,
    Tooltip,
    Dropdown,
    Menu,
    Badge,
    Statistic,
    Row,
    Col,
} from 'antd';
import {
    UserAddOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    TeamOutlined,
    CrownOutlined,
    MoreOutlined,
    SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { AddMemberModal } from './AddMemberModal';
import {
    teamService,
    TeamMember,
    ProjectRole,
    TeamStatistics,
} from '@/lib/api/services/project-module/team.service';

const { Title, Text } = Typography;
const { Option } = Select;

type TeamManagementProps = {
    projectId: number;
};

export const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [roles, setRoles] = useState<ProjectRole[]>([]);
    const [statistics, setStatistics] = useState<TeamStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState<number | undefined>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Modal states
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [membersData, rolesData, statsData] = await Promise.all([
                teamService.getMembers(projectId),
                teamService.getAvailableRoles(projectId),
                teamService.getStatistics(projectId),
            ]);
            setMembers(membersData);
            setRoles(rolesData);
            setStatistics(statsData);
        } catch (error) {
            console.error('Error fetching team data:', error);
            message.error('Không thể tải dữ liệu team');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    // Handle remove member
    const handleRemove = async (employeeId: number) => {
        try {
            await teamService.removeMember(projectId, employeeId);
            message.success('Đã xóa thành viên');
            fetchData();
        } catch (error: any) {
            console.error('Error removing member:', error);
            message.error(error.response?.data?.message || 'Không thể xóa thành viên');
        }
    };

    // Handle bulk remove
    const handleBulkRemove = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn thành viên để xóa');
            return;
        }

        try {
            const employeeIds = selectedRowKeys.map((key) => Number(key));
            const result = await teamService.removeMultipleMembers(projectId, employeeIds);
            
            if (result.success > 0) {
                message.success(`Đã xóa ${result.success}/${result.total} thành viên`);
                setSelectedRowKeys([]);
                fetchData();
            }
        } catch (error) {
            console.error('Error removing members:', error);
            message.error('Không thể xóa thành viên');
        }
    };

    // Handle change role
    const handleChangeRole = async (employeeId: number, newRoleId: number) => {
        try {
            await teamService.assignRole(projectId, employeeId, { project_role_id: newRoleId });
            message.success('Đã thay đổi role');
            fetchData();
        } catch (error: any) {
            console.error('Error changing role:', error);
            message.error(error.response?.data?.message || 'Không thể thay đổi role');
        }
    };

    // Handle bulk change role
    const handleBulkChangeRole = async (newRoleId: number) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn thành viên');
            return;
        }

        try {
            const employeeIds = selectedRowKeys.map((key) => Number(key));
            const result = await teamService.bulkAssignRole(projectId, {
                employee_ids: employeeIds,
                project_role_id: newRoleId,
            });

            if (result.success > 0) {
                message.success(`Đã thay đổi role cho ${result.success}/${result.total} thành viên`);
                setSelectedRowKeys([]);
                fetchData();
            }
        } catch (error) {
            console.error('Error changing roles:', error);
            message.error('Không thể thay đổi role');
        }
    };

    // Filter members
    const filteredMembers = members.filter((member) => {
        const matchSearch =
            !searchText ||
            member.employee.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
            member.employee.email.toLowerCase().includes(searchText.toLowerCase()) ||
            member.employee.username.toLowerCase().includes(searchText.toLowerCase());

        const matchRole = !filterRole || member.project_role.id === filterRole;

        return matchSearch && matchRole;
    });

    // Get role badge color
    const getRoleBadgeColor = (roleName: string) => {
        if (roleName.toLowerCase().includes('admin')) return 'red';
        if (roleName.toLowerCase().includes('member')) return 'blue';
        if (roleName.toLowerCase().includes('viewer')) return 'default';
        return 'purple';
    };

    // Table columns
    const columns: ColumnsType<TeamMember> = [
        {
            title: 'Thành viên',
            key: 'member',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        src={record.employee.avatar_url}
                    >
                        {record.employee.full_name[0]}
                    </Avatar>
                    <div>
                        <div>
                            <Text strong>{record.employee.full_name}</Text>
                            {record.employee.status !== 'ACTIVE' && (
                                <Tag color="red" style={{ marginLeft: 4 }}>
                                    {record.employee.status}
                                </Tag>
                            )}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.employee.email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Username',
            dataIndex: ['employee', 'username'],
            key: 'username',
            width: 120,
        },
        {
            title: 'Department',
            dataIndex: ['employee', 'department'],
            key: 'department',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Position',
            dataIndex: ['employee', 'position'],
            key: 'position',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Role',
            key: 'role',
            width: 150,
            render: (_, record) => (
                <Select
                    value={record.project_role.id}
                    style={{ width: '100%' }}
                    onChange={(value) => handleChangeRole(record.employee_id, value)}
                    size="small"
                >
                    {roles.map((role) => (
                        <Option key={role.id} value={role.id}>
                            <Tag color={getRoleBadgeColor(role.role_name)}>
                                {role.role_name}
                            </Tag>
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Assigned By',
            key: 'assigned_by',
            width: 150,
            render: (_, record) =>
                record.assigned_by ? (
                    <Tooltip title={`Assigned on ${dayjs(record.assigned_at).format('DD/MM/YYYY HH:mm')}`}>
                        <Text type="secondary">{record.assigned_by.full_name}</Text>
                    </Tooltip>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Joined Date',
            dataIndex: 'assigned_at',
            key: 'assigned_at',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.assigned_at).unix() - dayjs(b.assigned_at).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Popconfirm
                    title="Xóa thành viên này?"
                    description="Thành viên sẽ bị xóa khỏi project"
                    onConfirm={() => handleRemove(record.employee_id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Bulk actions menu
    const bulkActionsMenu = (
        <Menu>
            <Menu.SubMenu key="change-role" title="Đổi role" icon={<EditOutlined />}>
                {roles.map((role) => (
                    <Menu.Item
                        key={role.id}
                        onClick={() => handleBulkChangeRole(role.id)}
                    >
                        <Tag color={getRoleBadgeColor(role.role_name)}>
                            {role.role_name}
                        </Tag>
                    </Menu.Item>
                ))}
            </Menu.SubMenu>
            <Menu.Divider />
            <Menu.Item
                key="remove"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                    if (selectedRowKeys.length > 0) {
                        handleBulkRemove();
                    }
                }}
            >
                Xóa đã chọn
            </Menu.Item>
        </Menu>
    );

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Statistics Cards */}
                {statistics && (
                    <Row gutter={16}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng thành viên"
                                    value={statistics.total_members}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        {statistics.members_by_role.map((item, index) => (
                            <Col span={6} key={index}>
                                <Card>
                                    <Statistic
                                        title={item.role_name}
                                        value={item.count}
                                        prefix={
                                            item.role_name.toLowerCase().includes('admin') ? (
                                                <CrownOutlined />
                                            ) : item.role_name.toLowerCase().includes('viewer') ? (
                                                <SafetyOutlined />
                                            ) : (
                                                <UserOutlined />
                                            )
                                        }
                                        valueStyle={{
                                            color: item.role_name.toLowerCase().includes('admin')
                                                ? '#f5222d'
                                                : item.role_name.toLowerCase().includes('member')
                                                ? '#1890ff'
                                                : '#8c8c8c',
                                        }}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Main Card */}
                <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Title level={3} style={{ margin: 0 }}>
                                <TeamOutlined /> Team Management
                            </Title>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchData}
                                    loading={loading}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    onClick={() => setAddModalVisible(true)}
                                >
                                    Thêm thành viên
                                </Button>
                            </Space>
                        </div>

                        {/* Filters */}
                        <Space size="middle" wrap>
                            <Input
                                placeholder="Tìm kiếm thành viên..."
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                            <Select
                                placeholder="Lọc theo role"
                                style={{ width: 200 }}
                                value={filterRole}
                                onChange={setFilterRole}
                                allowClear
                            >
                                {roles.map((role) => (
                                    <Option key={role.id} value={role.id}>
                                        <Tag color={getRoleBadgeColor(role.role_name)}>
                                            {role.role_name}
                                        </Tag>
                                    </Option>
                                ))}
                            </Select>

                            {/* Bulk Actions */}
                            {selectedRowKeys.length > 0 && (
                                <Space>
                                    <Badge count={selectedRowKeys.length} offset={[-5, 0]}>
                                        <Dropdown overlay={bulkActionsMenu} trigger={['click']}>
                                            <Button icon={<MoreOutlined />}>
                                                Thao tác với {selectedRowKeys.length} người
                                            </Button>
                                        </Dropdown>
                                    </Badge>
                                </Space>
                            )}

                            <Typography.Text type="secondary" style={{ marginLeft: 'auto' }}>
                                Hiển thị: {filteredMembers.length} / {members.length} thành viên
                            </Typography.Text>
                        </Space>

                        {/* Table */}
                        <Table
                            columns={columns}
                            dataSource={filteredMembers}
                            rowKey="employee_id"
                            loading={loading}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                                preserveSelectedRowKeys: true,
                            }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} thành viên`,
                            }}
                            scroll={{ x: 1200 }}
                        />
                    </Space>
                </Card>
            </Space>

            {/* Add Member Modal */}
            <AddMemberModal
                visible={addModalVisible}
                projectId={projectId}
                onClose={() => setAddModalVisible(false)}
                onSuccess={() => {
                    setAddModalVisible(false);
                    fetchData();
                }}
            />
        </div>
    );
};