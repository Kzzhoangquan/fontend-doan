import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Tabs, Skeleton, Tag, Space, Typography, Avatar, Tooltip } from 'antd';
import {
    RocketOutlined,
    FlagOutlined,
    AppstoreOutlined,
    UserOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    TeamOutlined,
    SafetyOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { projectService, Project } from '@/lib/api/services/project-module/project.service';

const { Text, Title } = Typography;

interface ProjectHeaderProps {
    projectId: number;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectId }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch project info
    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await projectService.getById(projectId);
                setProject(data);
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    // Determine active tab based on pathname
    const getActiveTab = () => {
        if (pathname.includes('/sprints')) return 'sprint';
        if (pathname.includes('/epics')) return 'epics';
        if (pathname.includes('/boards')) return 'boards';
        if (pathname.includes('/team')) return 'team';
        if (pathname.includes('/notifications')) return 'notifications';
        // Default to sprint nếu chỉ có /dashboard/projects/:id
        return 'sprint';
    };

    // Handle tab change
    const handleTabChange = (key: string) => {
        switch (key) {
            case 'sprint':
                router.push(`/dashboard/projects/${projectId}/sprints`);
                break;
            case 'epics':
                router.push(`/dashboard/projects/${projectId}/epics`);
                break;
            case 'boards':
                router.push(`/dashboard/projects/${projectId}/boards/1`);
                break;
            case 'team':
                router.push(`/dashboard/projects/${projectId}/team`);
                break;
            case 'roles':
                router.push(`/dashboard/projects/${projectId}/roles`);
                break;
            case 'notifications':
                router.push(`/dashboard/projects/${projectId}/notifications`);
                break;
        }
    };

    if (loading) {
        return (
            <Card style={{ marginBottom: 16 }}>
                <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
        );
    }

    if (!project) {
        return null;
    }

    const tabItems = [
        {
            key: 'sprint',
            label: (
                <Space>
                    <RocketOutlined />
                    <span>Sprint Backlog</span>
                </Space>
            ),
        },
        {
            key: 'epics',
            label: (
                <Space>
                    <FlagOutlined />
                    <span>Epics</span>
                </Space>
            ),
        },
        {
            key: 'boards',
            label: (
                <Space>
                    <AppstoreOutlined />
                    <span>Board</span>
                </Space>
            ),
        },
        {
            key: 'team',
            label: (
                <Space>
                    <TeamOutlined />
                    <span>Team</span>
                </Space>
            ),
        },
        {
            key: 'roles',
            label: (
                <Space>
                    <SafetyOutlined />
                    <span>Roles</span>
                </Space>
            ),
        },
        {
            key: 'notifications',
            label: (
                <Space>
                    <BellOutlined />
                    <span>Notifications</span>
                </Space>
            ),
        },
    ];

    return (
        <Card 
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: 0 }}
        >
            {/* Project Info Section */}
            <div style={{ 
                padding: '16px 24px', 
                borderBottom: '1px solid #f0f0f0',
                background: 'linear-gradient(to right, #fafafa, #ffffff)',
            }}>
                <Space size="middle" style={{ width: '100%' }} wrap>
                    {/* Project Key Badge */}
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }}>
                        {project.project_key.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Project Details */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <Space direction="vertical" size={2}>
                            <Space size="small">
                                <Tag color="blue">{project.project_key}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <CalendarOutlined /> Project
                                </Text>
                            </Space>
                            <Title level={4} style={{ margin: 0 }}>
                                {project.project_name}
                            </Title>
                        </Space>
                    </div>

                    {/* Project Lead */}
                    {project.lead_employee && (
                        <Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Lead:
                            </Text>
                            <Tooltip title={project.lead_employee.email}>
                                <Space size="small">
                                    <Avatar 
                                        size="small" 
                                        icon={<UserOutlined />}
                                        style={{ 
                                            background: '#1890ff',
                                            fontSize: 12,
                                        }}
                                    >
                                        {project.lead_employee.full_name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Text strong style={{ fontSize: 13 }}>
                                        {project.lead_employee.full_name}
                                    </Text>
                                </Space>
                            </Tooltip>
                        </Space>
                    )}

                    {/* Additional Info Icon */}
                    <Tooltip title="View project details">
                        <InfoCircleOutlined 
                            style={{ 
                                fontSize: 16, 
                                color: '#8c8c8c',
                                cursor: 'pointer',
                            }}
                        />
                    </Tooltip>
                </Space>
            </div>

            {/* Navigation Tabs */}
            <Tabs
                activeKey={getActiveTab()}
                onChange={handleTabChange}
                items={tabItems}
                style={{ 
                    paddingLeft: 24,
                    paddingRight: 24,
                    marginBottom: 0,
                }}
                tabBarStyle={{
                    marginBottom: 0,
                }}
            />
        </Card>
    );
};