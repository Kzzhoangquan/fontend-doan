import React, { useEffect, useState } from 'react';
import {
    Modal,
    Space,
    Row,
    Col,
    Divider,
    Tabs,
} from 'antd';
import {
    DeploymentUnitOutlined,
    CommentOutlined,
    UserOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import { IssueEditForm } from './IssueEditForm';
import { IssueAssignees } from './IssueAssignees';
import { IssueComments } from './IssueComments';
import { IssueLinks } from './IssueLinks';

type IssueEditModalProps = {
    issueId: number | null;
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    currentEmployeeId?: number;
};

export const IssueEditModal: React.FC<IssueEditModalProps> = ({
    issueId,
    visible,
    onClose,
    onSuccess,
    currentEmployeeId = 1,
}) => {
    const [issueCode, setIssueCode] = useState<string>('');

    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    // Reset when modal closes
    useEffect(() => {
        if (!visible) {
            setIssueCode('');
        }
    }, [visible]);

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <DeploymentUnitOutlined />
                    <span>Chỉnh sửa Issue{issueCode ? `: ${issueCode}` : ''}</span>
                </Space>
            }
            onCancel={onClose}
            width={1200}
            centered
            footer={null}
            styles={{
                body: { padding: '16px 24px', maxHeight: '70vh' },
            }}
        >
            <Row gutter={24} style={{ height: '100%' }}>
                {/* Left Side - Issue Form */}
                <Col span={14}>
                    <div
                        style={{
                            height: 'calc(70vh - 80px)',
                            overflowY: 'auto',
                            paddingRight: 12,
                        }}
                    >
                        {issueId && (
                            <IssueEditForm
                                issueId={issueId}
                                onSuccess={handleSuccess}
                                onCancel={onClose}
                            />
                        )}
                    </div>
                </Col>

                {/* Divider */}
                <Col span={1}>
                    <Divider type="vertical" style={{ height: '100%' }} />
                </Col>

                {/* Right Side - Assignees, Links & Comments */}
                <Col span={9}>
                    <div
                        style={{
                            height: 'calc(70vh - 80px)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Tabs
                            defaultActiveKey="assignees"
                            style={{ height: '100%' }}
                            items={[
                                {
                                    key: 'assignees',
                                    label: (
                                        <Space>
                                            <UserOutlined />
                                            <span>Assignees</span>
                                        </Space>
                                    ),
                                    children: issueId ? (
                                        <div style={{ height: 'calc(70vh - 130px)', overflowY: 'auto' }}>
                                            <IssueAssignees
                                                issueId={issueId}
                                                projectId={1}
                                            />
                                        </div>
                                    ) : null,
                                },
                                {
                                    key: 'links',
                                    label: (
                                        <Space>
                                            <LinkOutlined />
                                            <span>Links</span>
                                        </Space>
                                    ),
                                    children: issueId ? (
                                        <div style={{ height: 'calc(70vh - 130px)', overflowY: 'auto' }}>
                                            <IssueLinks
                                                issueId={issueId}
                                                projectId={1}
                                            />
                                        </div>
                                    ) : null,
                                },
                                {
                                    key: 'comments',
                                    label: (
                                        <Space>
                                            <CommentOutlined />
                                            <span>Comments</span>
                                        </Space>
                                    ),
                                    children: issueId ? (
                                        <div style={{ height: 'calc(70vh - 130px)' }}>
                                            <IssueComments
                                                issueId={issueId}
                                                currentEmployeeId={currentEmployeeId}
                                            />
                                        </div>
                                    ) : null,
                                },
                            ]}
                        />
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};