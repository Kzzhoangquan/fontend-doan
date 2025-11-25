import React, { useEffect, useState } from 'react';
import {
    Card,
    Select,
    Avatar,
    Space,
    Tag,
    message,
    Spin,
    Typography,
    Tooltip,
} from 'antd';
import {
    UserOutlined,
    UserAddOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { issueService, Employee } from '@/lib/api/services/issue.service';

const { Option } = Select;
const { Text } = Typography;


type IssueAssigneesProps = {
    issueId: number;
    projectId?: number;
};

export const IssueAssignees: React.FC<IssueAssigneesProps> = ({
    issueId,
    projectId = 1,
}) => {
    const [assignees, setAssignees] = useState<Employee[]>([]);
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Fetch assignees
    const fetchAssignees = async () => {
        try {
            setLoading(true);
            const data = await issueService.getAssignees(issueId);
            setAssignees(data);
        } catch (error) {
            console.error('Error fetching assignees:', error);
            message.error('Không thể tải danh sách assignees');
        } finally {
            setLoading(false);
        }
    };

    // Fetch available employees
    const fetchAvailableEmployees = async () => {
        try {
            const data = await issueService.getProjectEmployees(projectId);
            setAvailableEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            message.error('Không thể tải danh sách nhân viên');
        }
    };

    // Add assignee
    const handleAddAssignee = async (employeeId: number) => {
        try {
            setAdding(true);
            await issueService.assignEmployee(issueId, employeeId);
            message.success('Đã thêm assignee');
            fetchAssignees();
        } catch (error: any) {
            console.error('Error adding assignee:', error);
            if (error.response?.status === 400) {
                message.warning('Nhân viên này đã được assign rồi');
            } else {
                message.error('Không thể thêm assignee');
            }
        } finally {
            setAdding(false);
        }
    };

    // Remove assignee
    const handleRemoveAssignee = async (employeeId: number) => {
        try {
            await issueService.removeAssignee(issueId, employeeId);
            message.success('Đã xóa assignee');
            fetchAssignees();
        } catch (error) {
            console.error('Error removing assignee:', error);
            message.error('Không thể xóa assignee');
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchAssignees();
            fetchAvailableEmployees();
        }
    }, [issueId]);

    // Filter out already assigned employees
    const filteredEmployees = availableEmployees.filter(
        (emp) => !assignees.some((assignee) => assignee.id === emp.id)
    );

    return (
        <Card
            size="small"
            title={
                <Space>
                    <UserOutlined />
                    <Text strong>Assignees</Text>
                    <Tag color="blue">{assignees.length}</Tag>
                </Space>
            }
            style={{ marginBottom: 16 }}
        >
            <Spin spinning={loading}>
                {/* Add Assignee Select */}
                <Select
                    style={{ width: '100%', marginBottom: 12 }}
                    placeholder={
                        <Space>
                            <UserAddOutlined />
                            <span>Thêm assignee...</span>
                        </Space>
                    }
                    showSearch
                    loading={adding}
                    optionFilterProp="children"
                    onChange={handleAddAssignee}
                    value={null}
                    disabled={filteredEmployees.length === 0}
                >
                    {filteredEmployees.map((emp) => (
                        <Option key={emp.id} value={emp.id}>
                            <Space>
                                <Avatar size="small" icon={<UserOutlined />}>
                                    {emp.full_name?.[0]}
                                </Avatar>
                                <span>{emp.full_name}</span>
                            </Space>
                        </Option>
                    ))}
                </Select>

                {/* Assignees List */}
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {assignees.length === 0 ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Chưa có assignee nào
                        </Text>
                    ) : (
                        assignees.map((assignee) => (
                            <div
                                key={assignee.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    background: '#f5f5f5',
                                    borderRadius: 4,
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e6f7ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f5f5f5';
                                }}
                            >
                                <Space>
                                    <Avatar
                                        size="small"
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#1890ff' }}
                                    >
                                        {assignee.full_name?.[0]}
                                    </Avatar>
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>
                                            {assignee.full_name}
                                        </Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {assignee.email}
                                        </Text>
                                    </div>
                                </Space>
                                <Tooltip title="Xóa assignee">
                                    <CloseOutlined
                                        style={{
                                            cursor: 'pointer',
                                            color: '#ff4d4f',
                                            fontSize: 12,
                                        }}
                                        onClick={() => handleRemoveAssignee(assignee.id)}
                                    />
                                </Tooltip>
                            </div>
                        ))
                    )}
                </Space>
            </Spin>
        </Card>
    );
};