import React, { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Space,
    Typography,
    message,
    Spin,
    Empty,
    Tag,
    Dropdown,
    Menu,
} from 'antd';
import {
    PlusOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SprintFormModal } from './SprintFormModal';
import { SprintIssueCard } from './SprintIssueCard';
import { IssueEditModal } from '../issue/EditForm/IssueEditModal';
import { CreateIssueModal } from '../issue/CreateIssueModal';
import { Issue, Sprint } from './sprint.types';
import { sprintService } from '@/lib/api/services/sprint.service';
import { SprintBacklogFilter, SprintFilterValues, useFilteredSprintData } from './SprintBacklogFilter';

const { Title, Text } = Typography;

type SprintBacklogProps = {
    projectId: number;
};

export const SprintBacklog: React.FC<SprintBacklogProps> = ({ projectId }) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
    const [sprintIssues, setSprintIssues] = useState<Record<number, Issue[]>>({});
    const [loading, setLoading] = useState(false);
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
    const [editingIssueId, setEditingIssueId] = useState<number | null>(null);
    const [issueEditModalVisible, setIssueEditModalVisible] = useState(false);
    const [createIssueModalVisible, setCreateIssueModalVisible] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<SprintFilterValues>({
        search: '',
        assigneeIds: [],
        issueTypeIds: [],
        epicIds: [],
    });

    // Fetch sprints and issues
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch sprints
            const sprintsData = await sprintService.getAll({ projectId });
            setSprints(sprintsData);

            // Fetch backlog
            const backlogData = await sprintService.getBacklog(projectId);
            setBacklogIssues(backlogData);

            // Fetch issues for each sprint
            const sprintIssuesData: Record<number, Issue[]> = {};
            for (const sprint of sprintsData) {
                const issuesData = await sprintService.getSprintIssues(sprint.id);
                sprintIssuesData[sprint.id] = issuesData;
            }
            setSprintIssues(sprintIssuesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    // Handle filter change
    const handleFilterChange = (newFilters: SprintFilterValues) => {
        setFilters(newFilters);
    };

    // Apply filters
    const { filteredBacklog, filteredSprintIssues, totalIssues, filteredCount } = useFilteredSprintData(
        backlogIssues,
        sprintIssues,
        filters
    );

    // Handle drag and drop
    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        // Same position
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const issueId = parseInt(draggableId.split('-')[1]);
        const sourceSprintId = source.droppableId === 'backlog' 
            ? 0 
            : parseInt(source.droppableId.split('-')[1]);
        const targetSprintId = destination.droppableId === 'backlog' 
            ? 0 
            : parseInt(destination.droppableId.split('-')[1]);

        try {
            // Move issue
            await sprintService.moveIssue({
                issue_id: issueId,
                target_sprint_id: targetSprintId,
                rank_order: destination.index + 1,
            });

            message.success('Đã di chuyển issue');
            fetchData();
        } catch (error) {
            console.error('Error moving issue:', error);
            message.error('Không thể di chuyển issue');
        }
    };

    // Start sprint
    const handleStartSprint = async (sprintId: number) => {
        try {
            await sprintService.start(sprintId);
            message.success('Đã bắt đầu sprint');
            fetchData();
        } catch (error: any) {
            console.error('Error starting sprint:', error);
            message.error(error.response?.data?.message || 'Không thể bắt đầu sprint');
        }
    };

    // Complete sprint
    const handleCompleteSprint = async (sprintId: number) => {
        try {
            await sprintService.complete(sprintId);
            message.success('Đã hoàn thành sprint');
            fetchData();
        } catch (error: any) {
            console.error('Error completing sprint:', error);
            message.error(error.response?.data?.message || 'Không thể hoàn thành sprint');
        }
    };

    // Delete sprint
    const handleDeleteSprint = async (sprintId: number) => {
        try {
            await sprintService.delete(sprintId);
            message.success('Đã xóa sprint');
            fetchData();
        } catch (error: any) {
            console.error('Error deleting sprint:', error);
            message.error(error.response?.data?.message || 'Không thể xóa sprint');
        }
    };

    // Get sprint status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'processing';
            case 'completed': return 'success';
            case 'closed': return 'default';
            default: return 'warning';
        }
    };

    // Handle edit issue
    const handleEditIssue = (issueId: number) => {
        setEditingIssueId(issueId);
        setIssueEditModalVisible(true);
    };

    // Handle issue edit success
    const handleIssueEditSuccess = () => {
        setIssueEditModalVisible(false);
        setEditingIssueId(null);
        fetchData();
    };

    // Handle create issue success
    const handleCreateIssueSuccess = () => {
        setCreateIssueModalVisible(false);
        fetchData();
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchData();
    };

    return (
        <div style={{ padding: '24px' }}>
            <Spin spinning={loading}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={3} style={{ margin: 0 }}>
                            <RocketOutlined /> Sprint Backlog
                        </Title>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="default"
                                icon={<PlusOutlined />}
                                onClick={() => setCreateIssueModalVisible(true)}
                            >
                                Create Issue
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingSprint(null);
                                    setFormModalVisible(true);
                                }}
                            >
                                Create Sprint
                            </Button>
                        </Space>
                    </div>

                    {/* Filter Component */}
                    <SprintBacklogFilter
                        projectId={projectId}
                        onFilterChange={handleFilterChange}
                        totalIssues={totalIssues}
                        filteredCount={filteredCount}
                    />

                    <DragDropContext onDragEnd={handleDragEnd}>
                        {/* Backlog */}
                        <Card
                            title={
                                <Space>
                                    <Text strong>Backlog</Text>
                                    <Tag>{filteredBacklog.length}</Tag>
                                    {filters.search || filters.assigneeIds.length > 0 || filters.issueTypeIds.length > 0 || filters.epicIds.length > 0 ? (
                                        <Tag color="orange">/ {backlogIssues.length} tổng</Tag>
                                    ) : null}
                                </Space>
                            }
                            style={{ marginBottom: 16 }}
                        >
                            <Droppable droppableId="backlog">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            minHeight: 100,
                                            background: snapshot.isDraggingOver ? '#f0f5ff' : 'transparent',
                                            borderRadius: 4,
                                            padding: 8,
                                        }}
                                    >
                                        {filteredBacklog.length === 0 ? (
                                            <Empty 
                                                description={
                                                    backlogIssues.length === 0 
                                                        ? "No issues in backlog" 
                                                        : "Không có issue nào phù hợp với bộ lọc"
                                                } 
                                            />
                                        ) : (
                                            filteredBacklog.map((issue, index) => (
                                                <Draggable
                                                    key={`issue-${issue.id}`}
                                                    draggableId={`issue-${issue.id}`}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <SprintIssueCard
                                                                issue={issue}
                                                                isDragging={snapshot.isDragging}
                                                                onEdit={handleEditIssue}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </Card>

                        {/* Sprints */}
                        {sprints.map((sprint) => {
                            const sprintFilteredIssues = filteredSprintIssues[sprint.id] || [];
                            const sprintTotalIssues = sprintIssues[sprint.id]?.length || 0;
                            const hasFilter = filters.search || filters.assigneeIds.length > 0 || filters.issueTypeIds.length > 0 || filters.epicIds.length > 0;

                            return (
                                <Card
                                    key={sprint.id}
                                    title={
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Space>
                                                <Text strong>{sprint.sprint_name}</Text>
                                                <Tag color={getStatusColor(sprint.status)}>
                                                    {sprint.status}
                                                </Tag>
                                                <Tag>{sprintFilteredIssues.length} issues</Tag>
                                                {hasFilter && sprintTotalIssues !== sprintFilteredIssues.length && (
                                                    <Tag color="orange">/ {sprintTotalIssues} tổng</Tag>
                                                )}
                                            </Space>
                                            <Space>
                                                {sprint.status === 'planning' && (
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<RocketOutlined />}
                                                        onClick={() => handleStartSprint(sprint.id)}
                                                    >
                                                        Start Sprint
                                                    </Button>
                                                )}
                                                {sprint.status === 'active' && (
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<CheckCircleOutlined />}
                                                        onClick={() => handleCompleteSprint(sprint.id)}
                                                    >
                                                        Complete
                                                    </Button>
                                                )}
                                                <Dropdown
                                                    overlay={
                                                        <Menu>
                                                            <Menu.Item
                                                                key="edit"
                                                                icon={<EditOutlined />}
                                                                onClick={() => {
                                                                    setEditingSprint(sprint);
                                                                    setFormModalVisible(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                key="delete"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleDeleteSprint(sprint.id)}
                                                            >
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu>
                                                    }
                                                >
                                                    <Button size="small" icon={<MoreOutlined />} />
                                                </Dropdown>
                                            </Space>
                                        </Space>
                                    }
                                    style={{ marginBottom: 16 }}
                                >
                                    {sprint.goal && (
                                        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                            Goal: {sprint.goal}
                                        </Text>
                                    )}
                                    <Droppable droppableId={`sprint-${sprint.id}`}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{
                                                    minHeight: 100,
                                                    background: snapshot.isDraggingOver ? '#f0f5ff' : 'transparent',
                                                    borderRadius: 4,
                                                    padding: 8,
                                                }}
                                            >
                                                {sprintFilteredIssues.length === 0 ? (
                                                    <Empty 
                                                        description={
                                                            sprintTotalIssues === 0 
                                                                ? "No issues in this sprint" 
                                                                : "Không có issue nào phù hợp với bộ lọc"
                                                        } 
                                                    />
                                                ) : (
                                                    sprintFilteredIssues.map((issue, index) => (
                                                        <Draggable
                                                            key={`issue-${issue.id}`}
                                                            draggableId={`issue-${issue.id}`}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <SprintIssueCard
                                                                        issue={issue}
                                                                        isDragging={snapshot.isDragging}
                                                                        onEdit={handleEditIssue}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </Card>
                            );
                        })}
                    </DragDropContext>
                </Space>
            </Spin>

            {/* Sprint Form Modal */}
            <SprintFormModal
                visible={formModalVisible}
                sprint={editingSprint}
                projectId={projectId}
                onClose={() => {
                    setFormModalVisible(false);
                    setEditingSprint(null);
                }}
                onSuccess={() => {
                    setFormModalVisible(false);
                    setEditingSprint(null);
                    fetchData();
                }}
            />

            {/* Issue Edit Modal */}
            <IssueEditModal
                visible={issueEditModalVisible}
                issueId={editingIssueId}
                onClose={() => {
                    setIssueEditModalVisible(false);
                    setEditingIssueId(null);
                }}
                onSuccess={handleIssueEditSuccess}
            />

            {/* Create Issue Modal */}
            <CreateIssueModal
                visible={createIssueModalVisible}
                projectId={projectId}
                onClose={() => setCreateIssueModalVisible(false)}
                onSuccess={handleCreateIssueSuccess}
            />
        </div>
    );
};