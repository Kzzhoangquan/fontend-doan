'use client';

import { use, useEffect, useState } from 'react';
import { Select, Spin, Alert, Space } from 'antd';
import { AppstoreOutlined, LoadingOutlined } from '@ant-design/icons';
import { BoardComponent } from '../../../../../components/project-module/issue/BoardComponent';
import { boardService, Workflow } from '@/lib/api/services/project-module/board.service';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function BoardPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch workflows khi component mount
    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await boardService.getProjectWorkflows(projectId);
                
                setWorkflows(data);
                
                // Mặc định chọn workflow đầu tiên
                if (data.length > 0) {
                    setSelectedWorkflowId(data[0].id);
                }
            } catch (err) {
                console.error('Error fetching workflows:', err);
                setError('Failed to load workflows. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchWorkflows();
        }
    }, [projectId]);

    // Loading state
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                }}
            >
                <Space direction="vertical" align="center" size="large">
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        size="large"
                    />
                    <div style={{ fontSize: '16px', color: '#595959' }}>
                        Loading workflows...
                    </div>
                </Space>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Alert
                    message="Error Loading Workflows"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    // No workflows state
    if (workflows.length === 0) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Alert
                    message="No Workflows Found"
                    description="This project doesn't have any workflows configured yet. Please configure workflows in project settings."
                    type="info"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header với Workflow Selector */}
            <div
                style={{
                    padding: '16px 24px',
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
            >
                <Space size="middle" align="center">
                    <AppstoreOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    <div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#8c8c8c',
                                marginBottom: '4px',
                            }}
                        >
                            Workflow
                        </div>
                        <Select
                            value={selectedWorkflowId}
                            onChange={(value) => setSelectedWorkflowId(value)}
                            style={{ minWidth: '280px' }}
                            size="large"
                            placeholder="Select a workflow"
                        >
                            {workflows.map((workflow) => (
                                <Select.Option key={workflow.id} value={workflow.id}>
                                    {workflow.workflow_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </Space>
            </div>

            {/* Board Component */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {selectedWorkflowId ? (
                    <BoardComponent projectId={projectId} boardId={selectedWorkflowId} />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        <Alert
                            message="No Workflow Selected"
                            description="Please select a workflow to view the board."
                            type="warning"
                            showIcon
                        />
                    </div>
                )}
            </div>
        </div>
    );
}