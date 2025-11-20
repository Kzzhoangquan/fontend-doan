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
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    FlagOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { EpicFormModal } from './EpicFormModal';
import { EpicDetailModal } from './EpicDetailModal';

const { Title } = Typography;
const { Option } = Select;

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
    issue_count?: number;
};

type Project = {
    id: number;
    project_name: string;
};

type EpicManagementProps = {
    projectId?: number;
};

export const EpicManagement: React.FC<EpicManagementProps> = ({ projectId }) => {
    const [epics, setEpics] = useState<Epic[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(projectId);
    const [searchText, setSearchText] = useState('');

    // Modal states
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
    const [viewingEpicId, setViewingEpicId] = useState<number | null>(null);

    // Fetch epics
    const fetchEpics = async (projectId?: number) => {
        try {
            setLoading(true);
            const params = projectId ? { projectId } : {};
            const response = await axios.get('http://localhost:3000/epics', { params });
            setEpics(response.data);
        } catch (error) {
            console.error('Error fetching epics:', error);
            message.error('Không thể tải danh sách epic');
        } finally {
            setLoading(false);
        }
    };

    // Fetch projects
    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:3000/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Delete epic
    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:3000/epics/${id}`);
            message.success('Đã xóa epic');
            fetchEpics(selectedProjectId);
        } catch (error: any) {
            console.error('Error deleting epic:', error);
            if (error.response?.status === 400) {
                message.error(error.response.data.message || 'Không thể xóa epic có issues');
            } else {
                message.error('Không thể xóa epic');
            }
        }
    };

    // Open create modal
    const handleCreate = () => {
        setEditingEpic(null);
        setFormModalVisible(true);
    };

    // Open edit modal
    const handleEdit = (epic: Epic) => {
        setEditingEpic(epic);
        setFormModalVisible(true);
    };

    // Open detail modal
    const handleView = (epicId: number) => {
        setViewingEpicId(epicId);
        setDetailModalVisible(true);
    };

    // Handle form success
    const handleFormSuccess = () => {
        setFormModalVisible(false);
        setEditingEpic(null);
        fetchEpics(selectedProjectId);
    };

    useEffect(() => {
        fetchProjects();
        fetchEpics(projectId);
    }, [projectId]);

    useEffect(() => {
        fetchEpics(selectedProjectId);
    }, [selectedProjectId]);

    // Filter epics by search text
    const filteredEpics = epics.filter((epic) =>
        epic.epic_name.toLowerCase().includes(searchText.toLowerCase()) ||
        epic.goal?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Get status color
    const getStatusColor = (status: string | null) => {
        if (!status) return 'default';
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('done') || lowerStatus.includes('complete')) return 'success';
        if (lowerStatus.includes('progress')) return 'processing';
        if (lowerStatus.includes('plan')) return 'warning';
        return 'default';
    };

    const columns: ColumnsType<Epic> = [
        {
            title: 'Epic Name',
            dataIndex: 'epic_name',
            key: 'epic_name',
            width: 250,
            render: (text, record) => (
                <Space>
                    <FlagOutlined style={{ color: '#1890ff' }} />
                    <Typography.Link onClick={() => handleView(record.id)}>
                        {text}
                    </Typography.Link>
                </Space>
            ),
        },
        {
            title: 'Project',
            dataIndex: ['project', 'project_name'],
            key: 'project',
            width: 150,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Goal',
            dataIndex: 'goal',
            key: 'goal',
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <Typography.Text type="secondary" ellipsis>
                        {text || '-'}
                    </Typography.Text>
                </Tooltip>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status || 'No Status'}</Tag>
            ),
        },
        {
            title: 'Issues',
            dataIndex: 'issue_count',
            key: 'issue_count',
            width: 80,
            align: 'center',
            render: (count) => (
                <Tag color={count > 0 ? 'blue' : 'default'}>{count || 0}</Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            width: 120,
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            width: 120,
            render: (date, record) => {
                if (!date) return '-';
                const dueDate = dayjs(date);
                const isOverdue = dueDate.isBefore(dayjs()) && record.status !== 'Done';
                return (
                    <Typography.Text type={isOverdue ? 'danger' : undefined}>
                        {dueDate.format('DD/MM/YYYY')}
                    </Typography.Text>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa epic này?"
                        description="Bạn chỉ có thể xóa epic không có issues."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Title level={3} style={{ margin: 0 }}>
                            <FlagOutlined /> Epic Management
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Create Epic
                        </Button>
                    </div>

                    {/* Filters */}
                    <Space size="middle" wrap>
                        <Input
                            placeholder="Search epic name or goal..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Select
                            placeholder="Filter by project"
                            style={{ width: 200 }}
                            value={selectedProjectId}
                            onChange={setSelectedProjectId}
                            allowClear
                        >
                            {projects.map((project) => (
                                <Option key={project.id} value={project.id}>
                                    {project.project_name}
                                </Option>
                            ))}
                        </Select>
                        <Typography.Text type="secondary">
                            Total: {filteredEpics.length} epic(s)
                        </Typography.Text>
                    </Space>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={filteredEpics}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                        }}
                        scroll={{ x: 1200 }}
                    />
                </Space>
            </Card>

            {/* Modals */}
            <EpicFormModal
                visible={formModalVisible}
                epic={editingEpic}
                projects={projects}
                onClose={() => {
                    setFormModalVisible(false);
                    setEditingEpic(null);
                }}
                onSuccess={handleFormSuccess}
            />

            <EpicDetailModal
                visible={detailModalVisible}
                epicId={viewingEpicId}
                onClose={() => {
                    setDetailModalVisible(false);
                    setViewingEpicId(null);
                }}
                onEdit={(epic) => {
                    setDetailModalVisible(false);
                    handleEdit(epic);
                }}
            />
        </div>
    );
};