import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Select,
    Button,
    message,
    Space,
    Avatar,
    Typography,
    Spin,
    Tabs,
    List,
    Tag,
    Empty,
} from 'antd';
import { UserAddOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import {
    teamService,
    Employee,
    ProjectRole,
    AddMemberDto,
    AddMultipleMembersDto,
} from '@/lib/api/services/project-module/team.service';

const { Option } = Select;
const { Text } = Typography;

type AddMemberModalProps = {
    visible: boolean;
    projectId: number;
    onClose: () => void;
    onSuccess: () => void;
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    visible,
    projectId,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'single' | 'multiple'>('single');

    const [nonMembers, setNonMembers] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<ProjectRole[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [selectedRole, setSelectedRole] = useState<number | undefined>();

    // Fetch data
    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible, projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [nonMembersData, rolesData] = await Promise.all([
                teamService.getNonMembers(projectId),
                teamService.getAvailableRoles(projectId),
            ]);
            setNonMembers(nonMembersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Handle single add
    const handleSingleSubmit = async (values: any) => {
        try {
            setSubmitting(true);
            await teamService.addMember(projectId, values);
            message.success('Đã thêm thành viên');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error('Error adding member:', error);
            if (error.response?.status === 409) {
                message.error('Thành viên này đã có trong project');
            } else {
                message.error(error.response?.data?.message || 'Không thể thêm thành viên');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle multiple add
    const handleMultipleSubmit = async () => {
        if (selectedEmployees.length === 0) {
            message.warning('Vui lòng chọn ít nhất một thành viên');
            return;
        }
        if (!selectedRole) {
            message.warning('Vui lòng chọn role');
            return;
        }

        try {
            setSubmitting(true);
            const data: AddMultipleMembersDto = {
                members: selectedEmployees.map((employee_id) => ({
                    employee_id,
                    project_role_id: selectedRole,
                })),
            };
            const result = await teamService.addMultipleMembers(projectId, data);
            
            if (result.success > 0) {
                message.success(`Đã thêm ${result.success}/${result.total} thành viên`);
                setSelectedEmployees([]);
                setSelectedRole(undefined);
                onSuccess();
            } else {
                message.error('Không thể thêm thành viên nào');
            }
        } catch (error: any) {
            console.error('Error adding members:', error);
            message.error('Không thể thêm thành viên');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedEmployees([]);
        setSelectedRole(undefined);
        setActiveTab('single');
        onClose();
    };

    const getRoleBadgeColor = (roleName: string) => {
        if (roleName.toLowerCase().includes('admin')) return 'red';
        if (roleName.toLowerCase().includes('member')) return 'blue';
        if (roleName.toLowerCase().includes('viewer')) return 'default';
        return 'purple';
    };

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <UserAddOutlined />
                    <span>Thêm thành viên vào Project</span>
                </Space>
            }
            onCancel={handleCancel}
            width={700}
            footer={null}
        >
            <Spin spinning={loading}>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as 'single' | 'multiple')}
                    items={[
                        {
                            key: 'single',
                            label: (
                                <Space>
                                    <UserOutlined />
                                    <span>Thêm 1 người</span>
                                </Space>
                            ),
                            children: (
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSingleSubmit}
                                    style={{ marginTop: 16 }}
                                >
                                    {/* Employee Select */}
                                    <Form.Item
                                        name="employee_id"
                                        label="Nhân viên"
                                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                                    >
                                        <Select
                                            placeholder="Chọn nhân viên"
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option: any) =>
                                                option.children.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {nonMembers.map((emp) => (
                                                <Option key={emp.id} value={emp.id}>
                                                    <Space>
                                                        <Avatar size="small" icon={<UserOutlined />}>
                                                            {emp.full_name[0]}
                                                        </Avatar>
                                                        <div>
                                                            <div>{emp.full_name}</div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {emp.email}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {/* Role Select */}
                                    <Form.Item
                                        name="project_role_id"
                                        label="Role"
                                        rules={[{ required: true, message: 'Vui lòng chọn role' }]}
                                    >
                                        <Select placeholder="Chọn role">
                                            {roles.map((role) => (
                                                <Option key={role.id} value={role.id}>
                                                    <Space direction="vertical" size={0}>
                                                        <Space>
                                                            <Tag color={getRoleBadgeColor(role.role_name)}>
                                                                {role.role_name}
                                                            </Tag>
                                                            {role.is_default && <Tag color="green">Mặc định</Tag>}
                                                        </Space>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {role.role_description}
                                                        </Text>
                                                    </Space>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {/* Footer */}
                                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                                        <Space style={{ float: 'right' }}>
                                            <Button onClick={handleCancel}>Hủy</Button>
                                            <Button type="primary" htmlType="submit" loading={submitting}>
                                                Thêm
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            key: 'multiple',
                            label: (
                                <Space>
                                    <TeamOutlined />
                                    <span>Thêm nhiều người</span>
                                </Space>
                            ),
                            children: (
                                <div style={{ marginTop: 16 }}>
                                    {/* Role Selection */}
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Chọn Role cho tất cả:</Text>
                                        <Select
                                            placeholder="Chọn role"
                                            style={{ width: '100%', marginTop: 8 }}
                                            value={selectedRole}
                                            onChange={setSelectedRole}
                                        >
                                            {roles.map((role) => (
                                                <Option key={role.id} value={role.id}>
                                                    <Space>
                                                        <Tag color={getRoleBadgeColor(role.role_name)}>
                                                            {role.role_name}
                                                        </Tag>
                                                        <Text>{role.role_description}</Text>
                                                    </Space>
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>

                                    {/* Employee List */}
                                    <Text strong>
                                        Chọn nhân viên ({selectedEmployees.length} đã chọn):
                                    </Text>
                                    <List
                                        bordered
                                        style={{ marginTop: 8, maxHeight: 300, overflow: 'auto' }}
                                        dataSource={nonMembers}
                                        locale={{
                                            emptyText: <Empty description="Không còn nhân viên nào để thêm" />,
                                        }}
                                        renderItem={(emp) => (
                                            <List.Item
                                                style={{
                                                    cursor: 'pointer',
                                                    background: selectedEmployees.includes(emp.id)
                                                        ? '#e6f7ff'
                                                        : 'white',
                                                }}
                                                onClick={() => {
                                                    if (selectedEmployees.includes(emp.id)) {
                                                        setSelectedEmployees(
                                                            selectedEmployees.filter((id) => id !== emp.id)
                                                        );
                                                    } else {
                                                        setSelectedEmployees([...selectedEmployees, emp.id]);
                                                    }
                                                }}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar icon={<UserOutlined />}>
                                                            {emp.full_name[0]}
                                                        </Avatar>
                                                    }
                                                    title={emp.full_name}
                                                    description={
                                                        <Space split="-">
                                                            <Text type="secondary">{emp.email}</Text>
                                                            {(emp.department || (emp as any).employee_positions?.find((ep: any) => ep.is_current)?.department?.name) && (
                                                                <Text type="secondary">
                                                                    {emp.department || (emp as any).employee_positions?.find((ep: any) => ep.is_current)?.department?.name}
                                                                </Text>
                                                            )}
                                                        </Space>
                                                    }
                                                />
                                                {selectedEmployees.includes(emp.id) && (
                                                    <Tag color="blue">Đã chọn</Tag>
                                                )}
                                            </List.Item>
                                        )}
                                    />

                                    {/* Footer */}
                                    <Space style={{ marginTop: 16, float: 'right' }}>
                                        <Button onClick={handleCancel}>Hủy</Button>
                                        <Button
                                            type="primary"
                                            onClick={handleMultipleSubmit}
                                            loading={submitting}
                                            disabled={selectedEmployees.length === 0 || !selectedRole}
                                        >
                                            Thêm {selectedEmployees.length} người
                                        </Button>
                                    </Space>
                                </div>
                            ),
                        },
                    ]}
                />
            </Spin>
        </Modal>
    );
};