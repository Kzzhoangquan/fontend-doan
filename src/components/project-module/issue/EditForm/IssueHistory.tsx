import React, { useEffect, useState } from 'react';
import {
    Card,
    Timeline,
    Space,
    Tag,
    message,
    Spin,
    Typography,
    Avatar,
    Empty,
    Tooltip,
} from 'antd';
import {
    HistoryOutlined,
    UserOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { issueService, IssueChangeHistory } from '@/lib/api/services/project-module/issue.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

type IssueHistoryProps = {
    issueId: number;
};

// Map field names to Vietnamese labels
const FIELD_LABELS: Record<string, string> = {
    issue_created: 'Tạo issue',
    issue_deleted: 'Xóa issue',
    issue_type_id: 'Loại issue',
    current_status_id: 'Trạng thái',
    epic_link_id: 'Epic',
    reporter_id: 'Người báo cáo',
    summary: 'Tóm tắt',
    description: 'Mô tả',
    story_points: 'Story points',
    original_estimate_seconds: 'Ước tính ban đầu',
    time_spent_seconds: 'Thời gian đã dùng',
    resolution: 'Giải pháp',
    assignee_added: 'Thêm assignee',
    assignee_removed: 'Xóa assignee',
    watcher_added: 'Thêm watcher',
    watcher_removed: 'Xóa watcher',
    link_created: 'Tạo liên kết',
    link_deleted: 'Xóa liên kết',
};

// Get tag color based on field name
const getFieldColor = (fieldName: string): string => {
    if (fieldName.includes('created') || fieldName.includes('added')) {
        return 'green';
    }
    if (fieldName.includes('deleted') || fieldName.includes('removed')) {
        return 'red';
    }
    if (fieldName.includes('status')) {
        return 'blue';
    }
    return 'default';
};

// Format time value (seconds to hours/minutes)
const formatTimeValue = (seconds: string | null): string => {
    if (!seconds || seconds === 'null') return '';
    const secs = parseInt(seconds, 10);
    if (isNaN(secs)) return seconds;
    
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

// Format change value for display
const formatValue = (fieldName: string, value: string | null): React.ReactNode => {
    if (!value || value === 'null') {
        return <Text type="secondary" italic>(trống)</Text>;
    }

    // Format time fields
    if (fieldName.includes('seconds')) {
        const formatted = formatTimeValue(value);
        return formatted || value;
    }

    return value;
};

export const IssueHistory: React.FC<IssueHistoryProps> = ({ issueId }) => {
    const [history, setHistory] = useState<IssueChangeHistory[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await issueService.getHistory(issueId);
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
            message.error('Không thể tải lịch sử thay đổi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchHistory();
        }
    }, [issueId]);

    const renderChangeContent = (change: IssueChangeHistory) => {
        const fieldLabel = FIELD_LABELS[change.field_name] || change.field_name;
        const hasChange = change.old_value || change.new_value;

        return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space>
                    <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                    >
                        {change.changer_employee?.full_name?.[0]}
                    </Avatar>
                    <Text strong style={{ fontSize: 13 }}>
                        {change.changer_employee?.full_name || 'Unknown'}
                    </Text>
                    <Tag color={getFieldColor(change.field_name)}>
                        {fieldLabel}
                    </Tag>
                </Space>

                {hasChange && (
                    <div style={{ marginLeft: 32, fontSize: 12 }}>
                        {change.old_value && (
                            <div>
                                <Text type="secondary">Từ: </Text>
                                <Text delete type="secondary">
                                    {formatValue(change.field_name, change.old_value)}
                                </Text>
                            </div>
                        )}
                        {change.new_value && (
                            <div>
                                <Text type="secondary">Đến: </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    {formatValue(change.field_name, change.new_value)}
                                </Text>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginLeft: 32 }}>
                    <Tooltip title={dayjs(change.change_date).format('DD/MM/YYYY HH:mm:ss')}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {dayjs(change.change_date).fromNow()}
                        </Text>
                    </Tooltip>
                </div>
            </Space>
        );
    };

    return (
        <Card
            size="small"
            title={
                <Space>
                    <HistoryOutlined />
                    <Text strong>Lịch sử thay đổi</Text>
                    {history.length > 0 && (
                        <Tag color="blue">{history.length}</Tag>
                    )}
                </Space>
            }
            style={{ marginBottom: 16 }}
        >
            <Spin spinning={loading}>
                {history.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có lịch sử thay đổi"
                        style={{ padding: '20px 0' }}
                    />
                ) : (
                    <div style={{ maxHeight: 'calc(70vh - 200px)', overflowY: 'auto' }}>
                        <Timeline
                            mode="left"
                            items={history.map((change) => ({
                                color: getFieldColor(change.field_name),
                                children: renderChangeContent(change),
                            }))}
                        />
                    </div>
                )}
            </Spin>
        </Card>
    );
};