import React, { useEffect, useState } from 'react';
import {
    Modal,
    Descriptions,
    Tag,
    Typography,
    Spin,
    message,
    Button,
    Space,
    Table,
    Empty,
} from 'antd';
import {
    FlagOutlined,
    EditOutlined,
    CalendarOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

type Issue = {
    id: number;
    issue_code: string;
    summary: string;
    issue_type?: {
        type_name: string;
    };
    current_status?: {
        status_name: string;
    };
    reporter?: {
        full_name: string;
    };
    assignees?: Array<{
        full_name: string;
    }>;
};

type Epic = {
    id: number;
    project_id: number;
    epic_name: string;
    goal: string | null;
    status: string | null;
    start_date: string | null;
    due_date: string | null;
    project?: {
        id: number;
        project_name: string;
    };
    issues?: Issue[];
};

type EpicDetailModalProps = {
    visible: boolean;
    epicId: number | null;
    onClose: () => void;
    onEdit: (epic: Epic) => void;
};

export const EpicDetailModal: React.FC<EpicDetailModalProps> = ({
    visible,
    epicId,
    onClose,
    onEdit,
}) => {
    const [epic, setEpic] = useState<Epic | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchEpicDetail = async (id: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/epics/${id}`);
            setEpic(response.data);
        } catch (error) {
            console.error('Error fetching epic detail:', error);
            message.error('Không thể tải chi tiết epic');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && epicId) {
            fetchEpicDetail(epicId);
        }
    }, [visible, epicId]);

    useEffect(() => {
        if (!visible) {
            setEpic(null);
        }
    }, [visible]);

    const getStatusColor = (status: string | null) => {
        if (!status) return 'default';
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('done') || lowerStatus.includes('complete')) return 'success';
        if (lowerStatus.includes('progress')) return 'processing';
        if (lowerStatus.includes('plan')) return 'warning';
        return 'default';
    };

    const issueColumns: ColumnsType<Issue> = [
        {
            title: 'Issue Code',
            dataIndex: 'issue_code',
            key: 'issue_code',
            width: 120,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            key: 'summary',
            ellipsis: true,
        },
        {
            title: 'Type',
            dataIndex: ['issue_type', 'type_name'],
            key: 'type',
            width: 100,
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: ['current_status', 'status_name'],
            key: 'status',
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Assignees',
            dataIndex: 'assignees',
            key: 'assignees',
            width: 150,
            render: (assignees: Issue['assignees']) => (
                <Space size={4} wrap>
                    {assignees && assignees.length > 0 ? (
                        assignees.map((assignee, index) => (
                            <Tag key={index} color="cyan" style={{ margin: 0 }}>
                                {assignee.full_name}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary">Unassigned</Text>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <FlagOutlined />
                    <span>Epic Details</span>
                </Space>
            }
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                <Button
                    key="edit"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => epic && onEdit(epic)}
                >
                    Edit Epic
                </Button>,
            ]}
        >
            <Spin spinning={loading}>
                {epic ? (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Epic Info */}
                        <div>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                {epic.epic_name}
                            </Title>

                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Project" span={2}>
                                    <Tag color="blue">{epic.project?.project_name}</Tag>
                                </Descriptions.Item>

                                <Descriptions.Item label="Status" span={2}>
                                    <Tag color={getStatusColor(epic.status)}>
                                        {epic.status || 'No Status'}
                                    </Tag>
                                </Descriptions.Item>

                                <Descriptions.Item label="Start Date">
                                    <Space>
                                        <CalendarOutlined />
                                        <Text>
                                            {epic.start_date
                                                ? dayjs(epic.start_date).format('DD/MM/YYYY')
                                                : '-'}
                                        </Text>
                                    </Space>
                                </Descriptions.Item>

                                <Descriptions.Item label="Due Date">
                                    <Space>
                                        <CalendarOutlined />
                                        <Text
                                            type={
                                                epic.due_date &&
                                                dayjs(epic.due_date).isBefore(dayjs()) &&
                                                epic.status !== 'Done'
                                                    ? 'danger'
                                                    : undefined
                                            }
                                        >
                                            {epic.due_date
                                                ? dayjs(epic.due_date).format('DD/MM/YYYY')
                                                : '-'}
                                        </Text>
                                    </Space>
                                </Descriptions.Item>

                                <Descriptions.Item label="Goal" span={2}>
                                    {epic.goal ? (
                                        <Paragraph style={{ margin: 0 }}>{epic.goal}</Paragraph>
                                    ) : (
                                        <Text type="secondary">No goal specified</Text>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        {/* Issues Section */}
                        <div>
                            <Title level={5} style={{ marginBottom: 12 }}>
                                <FileTextOutlined /> Issues ({epic.issues?.length || 0})
                            </Title>

                            {epic.issues && epic.issues.length > 0 ? (
                                <Table
                                    columns={issueColumns}
                                    dataSource={epic.issues}
                                    rowKey="id"
                                    pagination={{
                                        pageSize: 5,
                                        size: 'small',
                                    }}
                                    size="small"
                                />
                            ) : (
                                <Empty
                                    description="No issues linked to this epic"
                                    style={{ padding: '24px 0' }}
                                />
                            )}
                        </div>
                    </Space>
                ) : (
                    <Empty description="No data" />
                )}
            </Spin>
        </Modal>
    );
};