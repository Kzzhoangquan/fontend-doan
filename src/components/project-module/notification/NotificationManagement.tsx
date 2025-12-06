import React, { useEffect, useState } from 'react';
import {
    Card,
    Typography,
    Spin,
    message,
    Space,
    Tag,
    Button,
    Descriptions,
    Divider,
} from 'antd';
import {
    BellOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { ProjectNotificationConfig } from './ProjectNotificationConfig';
import {
    notificationManagementService,
    NotificationScheme,
    EventGroup,
} from '@/lib/api/services/project-module/notification-management.service';
import { projectService, Project } from '@/lib/api/services/project-module/project.service';

const { Title, Text } = Typography;

type NotificationManagementProps = {
    projectId: number;
};

export const NotificationManagement: React.FC<NotificationManagementProps> = ({ projectId }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [scheme, setScheme] = useState<NotificationScheme | null>(null);
    const [events, setEvents] = useState<EventGroup[]>([]);
    const [availableEvents, setAvailableEvents] = useState<string[]>([]);
    const [availableRecipients, setAvailableRecipients] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch project and notification config
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch project
            const projectData = await projectService.getById(projectId);
            setProject(projectData);

            // Fetch notification scheme của project
            if (projectData.notification_scheme_id) {
                const [schemeData, eventsData, allEvents, recipients] = await Promise.all([
                    notificationManagementService.getSchemeById(projectData.notification_scheme_id),
                    notificationManagementService.getSchemeEventsGrouped(projectData.notification_scheme_id),
                    notificationManagementService.getAllAvailableEvents(),
                    notificationManagementService.getAvailableRecipientTypes(),
                ]);

                setScheme(schemeData);
                setEvents(eventsData);
                setAvailableEvents(allEvents);
                setAvailableRecipients(recipients);
            } else {
                message.warning('Project chưa có notification scheme');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Không thể tải cấu hình notification');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    // Handle recipient toggle
    const handleRecipientToggle = async (
        eventName: string,
        recipientType: string,
        checked: boolean
    ) => {
        if (!scheme) return;

        try {
            if (checked) {
                await notificationManagementService.bulkAddRecipients({
                    notification_scheme_id: scheme.id,
                    event_name: eventName,
                    recipient_types: [recipientType],
                });
                message.success(`Đã thêm ${recipientType} vào ${eventName}`);
            } else {
                await notificationManagementService.bulkRemoveRecipients({
                    notification_scheme_id: scheme.id,
                    event_name: eventName,
                    recipient_types: [recipientType],
                });
                message.success(`Đã xóa ${recipientType} khỏi ${eventName}`);
            }
            fetchData();
        } catch (error) {
            console.error('Error toggling recipient:', error);
            message.error('Không thể cập nhật recipient');
        }
    };

    if (!project) {
        return (
            <div style={{ padding: '24px' }}>
                <Spin />
            </div>
        );
    }

    if (!scheme) {
        return (
            <div style={{ padding: '24px' }}>
                <Card>
                    <Space direction="vertical" align="center" style={{ width: '100%', padding: '40px 0' }}>
                        <InfoCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <Title level={4}>No Notification Scheme</Title>
                        <Text type="secondary">
                            Project này chưa được gán notification scheme.
                        </Text>
                        <Text type="secondary">
                            Vui lòng liên hệ admin để cấu hình.
                        </Text>
                    </Space>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Spin spinning={loading}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Header */}
                    <Card>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Space direction="vertical" size="small">
                                <Title level={3} style={{ margin: 0 }}>
                                    <BellOutlined /> Notification Settings
                                </Title>
                                <Text type="secondary">
                                    Cấu hình email notifications cho project {project.project_name}
                                </Text>
                            </Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchData}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                        </div>
                    </Card>

                    {/* Project & Scheme Info */}
                    <Card size="small" title="Project Information">
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="Project Name">
                                <Text strong>{project.project_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Project Key">
                                <Tag color="blue">{project.project_key}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Notification Scheme" span={2}>
                                <Space>
                                    <Tag color="green">{scheme.scheme_name}</Tag>
                                    {scheme.scheme_description && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {scheme.scheme_description}
                                        </Text>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Events" span={2}>
                                <Space split={<Divider type="vertical" />}>
                                    <Text>
                                        Configured: <Tag color="blue">{events.length}</Tag>
                                    </Text>
                                    <Text>
                                        Total Rules:{' '}
                                        <Tag color="cyan">
                                            {events.reduce((sum, e) => sum + e.recipients.length, 0)}
                                        </Tag>
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Notification Configuration */}
                    <ProjectNotificationConfig
                        events={events}
                        availableEvents={availableEvents}
                        availableRecipients={availableRecipients}
                        onRecipientToggle={handleRecipientToggle}
                        loading={loading}
                    />
                </Space>
            </Spin>
        </div>
    );
};