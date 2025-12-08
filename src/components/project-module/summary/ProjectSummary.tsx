'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Space,
    Tag,
    Table,
    Spin,
    Empty,
    Avatar,
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    RocketOutlined,
    FlagOutlined,
    TrophyOutlined,
    RiseOutlined,
    FireOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next'; // 👈 Import
import type { ColumnsType } from 'antd/es/table';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import {
    statisticsService,
    ProjectOverallStatistics,
    TopContributor,
} from '@/lib/api/services/project-module/statistics.service';

const { Title, Text } = Typography;

interface ProjectSummaryProps {
    projectId: number;
}

// Colors for charts
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
const STATUS_COLORS: Record<string, string> = {
    'To Do': '#faad14',
    'In Progress': '#1890ff',
    'Done': '#52c41a',
    'Blocked': '#f5222d',
};

export const ProjectSummary: React.FC<ProjectSummaryProps> = ({ projectId }) => {
    const { t } = useTranslation(); // 👈 Hook
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ProjectOverallStatistics | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const data = await statisticsService.getProjectOverview(projectId);
                setStats(data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchStatistics();
        }
    }, [projectId]);

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="large" tip={t('summary.loading')} />
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ padding: '24px' }}>
                <Empty description={t('summary.noData')} />
            </div>
        );
    }

    // Prepare chart data
    const statusChartData = stats.issue_stats.by_status.map((item) => ({
        name: item.status_name,
        value: item.count,
        percentage: item.percentage,
    }));

    const typeChartData = stats.issue_stats.by_type.map((item) => ({
        name: item.type_name,
        value: item.count,
    }));

    const velocityChartData = stats.sprint_stats.velocity_stats.velocity_trend
        .slice(0, 6)
        .reverse()
        .map((item) => ({
            name: item.sprint_name,
            completed: item.completed_story_points,
            committed: item.committed_story_points,
        }));

    const topContributorsChartData = stats.team_stats.top_contributors
        .slice(0, 5)
        .map((item) => ({
            name: item.employee_name.split(' ').slice(-1)[0],
            completed: item.issues_completed,
            assigned: item.issues_assigned,
        }));

    const epicRadarData = stats.epic_stats.issue_distribution
        .slice(0, 5)
        .map((item) => ({
            epic: item.epic_name.substring(0, 15) + (item.epic_name.length > 15 ? '...' : ''),
            progress: item.progress_percentage,
            fullMark: 100,
        }));

    const sprintPerformanceData = stats.sprint_stats.sprint_performance
        .slice(0, 5)
        .reverse()
        .map((item) => ({
            name: item.sprint_name,
            rate: item.completion_rate,
        }));

    const renderCustomLabel = (entry: any) => {
        return `${entry.name}: ${entry.value}`;
    };

    // 👇 Table columns với multilang
    const contributorColumns: ColumnsType<TopContributor> = [
        {
            title: t('summary.table.contributor'),
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (text) => (
                <Space>
                    <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                        {text[0]}
                    </Avatar>
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: t('summary.table.assigned'),
            dataIndex: 'issues_assigned',
            key: 'assigned',
            align: 'center',
            render: (count) => <Tag color="blue">{count}</Tag>,
        },
        {
            title: t('summary.table.completed'),
            dataIndex: 'issues_completed',
            key: 'completed',
            align: 'center',
            render: (count) => <Tag color="green">{count}</Tag>,
        },
        {
            title: t('summary.table.rate'),
            key: 'rate',
            align: 'center',
            render: (_, record) => {
                const rate = record.issues_assigned > 0
                    ? ((record.issues_completed / record.issues_assigned) * 100).toFixed(0)
                    : 0;
                return <Text strong>{rate}%</Text>;
            },
        },
    ];

    // 👇 Helper để dịch sprint status
    const getSprintStatusLabel = (status: string) => {
        const statusKey = status.toLowerCase() as 'active' | 'completed' | 'planning' | 'closed';
        return t(`summary.sprint.${statusKey}`, status.toUpperCase());
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 200px)' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* KPI Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title={t('summary.kpi.totalIssues')}
                                value={stats.issue_stats.total_issues}
                                prefix={<FireOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff', fontSize: 28 }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title={t('summary.kpi.resolutionRate')}
                                value={stats.issue_stats.resolution_stats.resolution_rate.toFixed(1)}
                                suffix="%"
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a', fontSize: 28 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {stats.issue_stats.resolution_stats.resolved} {t('summary.kpi.resolved')} /{' '}
                                {stats.issue_stats.resolution_stats.unresolved} {t('summary.kpi.open')}
                            </Text>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title={t('summary.kpi.avgVelocity')}
                                value={stats.sprint_stats.velocity_stats.average_velocity.toFixed(1)}
                                suffix="SP"
                                prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16', fontSize: 28 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {stats.sprint_stats.total_sprints} {t('summary.kpi.sprintsCompleted')}
                            </Text>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false}>
                            <Statistic
                                title={t('summary.kpi.teamMembers')}
                                value={stats.team_stats.total_members}
                                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                                valueStyle={{ color: '#722ed1', fontSize: 28 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {stats.team_stats.active_contributors} {t('summary.kpi.activeContributors')}
                            </Text>
                        </Card>
                    </Col>
                </Row>

                {/* Charts Row 1: Issues Distribution */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <span>{t('summary.charts.issuesByStatus')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <RiseOutlined style={{ color: '#722ed1' }} />
                                    <span>{t('summary.charts.issuesByType')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={typeChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill="#722ed1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Charts Row 2: Velocity & Contributors */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <RocketOutlined style={{ color: '#1890ff' }} />
                                    <span>{t('summary.charts.velocityTrend')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={velocityChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#52c41a"
                                        strokeWidth={2}
                                        name={t('summary.chartLabels.completedSP')}
                                        dot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="committed"
                                        stroke="#1890ff"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        name={t('summary.chartLabels.committedSP')}
                                        dot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <TeamOutlined style={{ color: '#fa8c16' }} />
                                    <span>{t('summary.charts.topContributors')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topContributorsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar 
                                        dataKey="assigned" 
                                        fill="#1890ff" 
                                        name={t('summary.chartLabels.assigned')} 
                                        radius={[8, 8, 0, 0]} 
                                    />
                                    <Bar 
                                        dataKey="completed" 
                                        fill="#52c41a" 
                                        name={t('summary.chartLabels.completed')} 
                                        radius={[8, 8, 0, 0]} 
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Charts Row 3: Epic Progress & Sprint Performance */}
                <Row gutter={[16, 16]}>
                    {epicRadarData.length > 0 && (
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <Space>
                                        <FlagOutlined style={{ color: '#722ed1' }} />
                                        <span>{t('summary.charts.epicProgress')}</span>
                                    </Space>
                                }
                                bordered={false}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={epicRadarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="epic" />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                        <Radar
                                            name={t('summary.chartLabels.progressPercent')}
                                            dataKey="progress"
                                            stroke="#722ed1"
                                            fill="#722ed1"
                                            fillOpacity={0.6}
                                        />
                                        <RechartsTooltip />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    )}

                    {sprintPerformanceData.length > 0 && (
                        <Col xs={24} lg={epicRadarData.length > 0 ? 12 : 24}>
                            <Card
                                title={
                                    <Space>
                                        <TrophyOutlined style={{ color: '#52c41a' }} />
                                        <span>{t('summary.charts.sprintCompletion')}</span>
                                    </Space>
                                }
                                bordered={false}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={sprintPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                                        <YAxis domain={[0, 100]} />
                                        <RechartsTooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="rate"
                                            stroke="#52c41a"
                                            strokeWidth={3}
                                            name={t('summary.chartLabels.completionPercent')}
                                            dot={{ r: 6, fill: '#52c41a' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    )}
                </Row>

                {/* Story Points & Time Stats */}
                <Card
                    title={
                        <Space>
                            <TrophyOutlined style={{ color: '#fa8c16' }} />
                            <span>{t('summary.charts.storyPointsTracking')}</span>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card style={{ background: '#f0f5ff', border: 'none' }}>
                                <Statistic
                                    title={t('summary.storyPoints.total')}
                                    value={stats.issue_stats.time_stats.total_story_points}
                                    precision={0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card style={{ background: '#f6ffed', border: 'none' }}>
                                <Statistic
                                    title={t('summary.storyPoints.average')}
                                    value={stats.issue_stats.time_stats.average_story_points}
                                    precision={1}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card style={{ background: '#fff7e6', border: 'none' }}>
                                <Statistic
                                    title={t('summary.storyPoints.estimatedHours')}
                                    value={stats.issue_stats.time_stats.total_estimated_hours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: '#fa8c16' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card style={{ background: '#fff1f0', border: 'none' }}>
                                <Statistic
                                    title={t('summary.storyPoints.timeSpent')}
                                    value={stats.issue_stats.time_stats.total_spent_hours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: '#f5222d' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>

                {/* Top Contributors Table */}
                <Card
                    title={
                        <Space>
                            <TeamOutlined style={{ color: '#1890ff' }} />
                            <span>{t('summary.charts.topContributorsDetails')}</span>
                        </Space>
                    }
                    bordered={false}
                >
                    <Table
                        columns={contributorColumns}
                        dataSource={stats.team_stats.top_contributors.slice(0, 5)}
                        rowKey="employee_id"
                        pagination={false}
                        size="middle"
                    />
                </Card>

                {/* Summary Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card
                            title={
                                <Space>
                                    <FlagOutlined />
                                    <span>{t('summary.charts.epicSummary')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title={t('summary.epic.total')}
                                        value={stats.epic_stats.total_epics}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t('summary.epic.completed')}
                                        value={stats.epic_stats.completion_stats.completed}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t('summary.epic.inProgress')}
                                        value={stats.epic_stats.completion_stats.in_progress}
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card
                            title={
                                <Space>
                                    <RocketOutlined />
                                    <span>{t('summary.charts.sprintSummary')}</span>
                                </Space>
                            }
                            bordered={false}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {stats.sprint_stats.by_status.map((status) => (
                                    <div key={status.status}>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <Tag
                                                color={
                                                    status.status === 'active'
                                                        ? 'processing'
                                                        : status.status === 'completed'
                                                        ? 'success'
                                                        : 'default'
                                                }
                                            >
                                                {getSprintStatusLabel(status.status)}
                                            </Tag>
                                            <Text strong style={{ fontSize: 16 }}>
                                                {status.count}
                                            </Text>
                                        </Space>
                                    </div>
                                ))}
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};