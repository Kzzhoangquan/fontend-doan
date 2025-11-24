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
    EyeOutlined,
    PlusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { issueService, Employee } from '@/lib/api/services/issue.service';

const { Option } = Select;
const { Text } = Typography;

type IssueWatchersProps = {
    issueId: number;
    projectId?: number;
    currentEmployeeId?: number; // ID của user hiện tại để highlight
};

export const IssueWatchers: React.FC<IssueWatchersProps> = ({
    issueId,
    projectId = 1,
    currentEmployeeId,
}) => {
    const [watchers, setWatchers] = useState<Employee[]>([]);
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Check if current user is watching
    const isCurrentUserWatching = watchers.some(w => w.id === currentEmployeeId);

    // Fetch watchers
    const fetchWatchers = async () => {
        try {
            setLoading(true);
            const data = await issueService.getWatchers(issueId);
            setWatchers(data);
        } catch (error) {
            console.error('Error fetching watchers:', error);
            message.error('Không thể tải danh sách watchers');
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

    // Add watcher
    const handleAddWatcher = async (employeeId: number) => {
        try {
            setAdding(true);
            await issueService.addWatcher(issueId, employeeId);
            message.success('Đã thêm watcher');
            fetchWatchers();
        } catch (error: any) {
            console.error('Error adding watcher:', error);
            if (error.response?.status === 400) {
                message.warning('Người này đã đang theo dõi issue');
            } else {
                message.error('Không thể thêm watcher');
            }
        } finally {
            setAdding(false);
        }
    };

    // Remove watcher
    const handleRemoveWatcher = async (employeeId: number) => {
        try {
            await issueService.removeWatcher(issueId, employeeId);
            message.success('Đã xóa watcher');
            fetchWatchers();
        } catch (error) {
            console.error('Error removing watcher:', error);
            message.error('Không thể xóa watcher');
        }
    };

    // Toggle watch for current user
    const handleToggleWatch = async () => {
        if (!currentEmployeeId) {
            message.warning('Không xác định được người dùng hiện tại');
            return;
        }

        try {
            setAdding(true);
            if (isCurrentUserWatching) {
                await issueService.removeWatcher(issueId, currentEmployeeId);
                message.success('Đã hủy theo dõi issue');
            } else {
                await issueService.addWatcher(issueId, currentEmployeeId);
                message.success('Đã bắt đầu theo dõi issue');
            }
            fetchWatchers();
        } catch (error) {
            console.error('Error toggling watch:', error);
            message.error('Không thể thay đổi trạng thái theo dõi');
        } finally {
            setAdding(false);
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchWatchers();
            fetchAvailableEmployees();
        }
    }, [issueId]);

    // Filter out already watching employees
    const filteredEmployees = availableEmployees.filter(
        (emp) => !watchers.some((watcher) => watcher.id === emp.id)
    );

    return (
        <Card
            size="small"
            title={
                <Space>
                    <EyeOutlined />
                    <Text strong>Watchers</Text>
                    <Tag color="purple">{watchers.length}</Tag>
                </Space>
            }
            extra={
                currentEmployeeId && (
                    <Tooltip title={isCurrentUserWatching ? 'Hủy theo dõi' : 'Theo dõi issue này'}>
                        <Tag
                            color={isCurrentUserWatching ? 'purple' : 'default'}
                            style={{ cursor: 'pointer' }}
                            onClick={handleToggleWatch}
                        >
                            <EyeOutlined style={{ marginRight: 4 }} />
                            {isCurrentUserWatching ? 'Đang theo dõi' : 'Theo dõi'}
                        </Tag>
                    </Tooltip>
                )
            }
            style={{ marginBottom: 16 }}
        >
            <Spin spinning={loading}>
                {/* Add Watcher Select */}
                <Select
                    style={{ width: '100%', marginBottom: 12 }}
                    placeholder={
                        <Space>
                            <PlusOutlined />
                            <span>Thêm watcher...</span>
                        </Space>
                    }
                    showSearch
                    loading={adding}
                    optionFilterProp="children"
                    onChange={handleAddWatcher}
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

                {/* Watchers List */}
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {watchers.length === 0 ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Chưa có ai theo dõi issue này
                        </Text>
                    ) : (
                        watchers.map((watcher) => (
                            <div
                                key={watcher.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    background: watcher.id === currentEmployeeId ? '#f9f0ff' : '#f5f5f5',
                                    borderRadius: 4,
                                    border: watcher.id === currentEmployeeId ? '1px solid #d3adf7' : 'none',
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = watcher.id === currentEmployeeId ? '#efdbff' : '#e6f7ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = watcher.id === currentEmployeeId ? '#f9f0ff' : '#f5f5f5';
                                }}
                            >
                                <Space>
                                    <Avatar
                                        size="small"
                                        icon={<UserOutlined />}
                                        style={{ 
                                            backgroundColor: watcher.id === currentEmployeeId ? '#722ed1' : '#1890ff' 
                                        }}
                                    >
                                        {watcher.full_name?.[0]}
                                    </Avatar>
                                    <div>
                                        <Space size={4}>
                                            <Text strong style={{ fontSize: 13 }}>
                                                {watcher.full_name}
                                            </Text>
                                            {watcher.id === currentEmployeeId && (
                                                <Tag color="purple" style={{ fontSize: 10, padding: '0 4px' }}>
                                                    Bạn
                                                </Tag>
                                            )}
                                        </Space>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {watcher.email}
                                        </Text>
                                    </div>
                                </Space>
                                <Tooltip title="Xóa watcher">
                                    <CloseOutlined
                                        style={{
                                            cursor: 'pointer',
                                            color: '#ff4d4f',
                                            fontSize: 12,
                                        }}
                                        onClick={() => handleRemoveWatcher(watcher.id)}
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