import React, { useEffect, useState } from 'react';
import {
    Modal,
    Space,
    Row,
    Col,
    Divider,
    Tabs,
    Button,
    Popconfirm,
    message,
    Typography,
    Alert,
} from 'antd';
import {
    DeploymentUnitOutlined,
    CommentOutlined,
    UserOutlined,
    LinkOutlined,
    HistoryOutlined,
    EyeOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { IssueEditForm } from './IssueEditForm';
import { IssueAssignees } from './IssueAssignees';
import { IssueWatchers } from './IssueWatchers';
import { IssueComments } from './IssueComments';
import { IssueLinks } from './IssueLinks';
import { IssueHistory } from './IssueHistory';
import { issueService } from '@/lib/api/services/project-module/issue.service';

const { Text } = Typography;

type IssueEditModalProps = {
    issueId: number | null;
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onDelete?: () => void; // Callback sau khi xóa thành công
    currentEmployeeId?: number;
};

export const IssueEditModal: React.FC<IssueEditModalProps> = ({
    issueId,
    visible,
    onClose,
    onSuccess,
    onDelete,
    currentEmployeeId = 1,
}) => {
    const [issueCode, setIssueCode] = useState<string>('');
    const [issueSummary, setIssueSummary] = useState<string>('');
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    // Fetch issue info for delete confirmation
    const fetchIssueInfo = async () => {
        if (!issueId) return;
        try {
            const issue = await issueService.getById(issueId);
            setIssueCode(issue.issue_code);
            setIssueSummary(issue.summary);
        } catch (error) {
            console.error('Error fetching issue info:', error);
        }
    };

    // Handle delete issue
    const handleDeleteIssue = async () => {
        if (!issueId) return;

        try {
            setDeleting(true);
            await issueService.delete(issueId);
            message.success(`Issue ${issueCode} đã được xóa thành công`);
            setDeleteConfirmVisible(false);
            onDelete?.();
            onClose();
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error: any) {
            console.error('Error deleting issue:', error);
            const errorMessage = error.response?.data?.message || 'Không thể xóa issue';
            message.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    // Reset when modal closes
    useEffect(() => {
        if (!visible) {
            setIssueCode('');
            setIssueSummary('');
            setDeleteConfirmVisible(false);
        } else if (issueId) {
            fetchIssueInfo();
        }
    }, [visible, issueId]);

    return (
        <>
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
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Delete Button - Left side */}
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setDeleteConfirmVisible(true)}
                            loading={deleting}
                        >
                            Xóa Issue
                        </Button>

                        {/* Close Button - Right side */}
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                }
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

                    {/* Right Side - Assignees, Watchers, Links, Comments & History */}
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
                                        key: 'watchers',
                                        label: (
                                            <Space>
                                                <EyeOutlined />
                                                <span>Watchers</span>
                                            </Space>
                                        ),
                                        children: issueId ? (
                                            <div style={{ height: 'calc(70vh - 130px)', overflowY: 'auto' }}>
                                                <IssueWatchers
                                                    issueId={issueId}
                                                    projectId={1}
                                                    currentEmployeeId={currentEmployeeId}
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
                                    {
                                        key: 'history',
                                        label: (
                                            <Space>
                                                <HistoryOutlined />
                                                <span>History</span>
                                            </Space>
                                        ),
                                        children: issueId ? (
                                            <div style={{ height: 'calc(70vh - 130px)', overflowY: 'auto' }}>
                                                <IssueHistory issueId={issueId} />
                                            </div>
                                        ) : null,
                                    },
                                ]}
                            />
                        </div>
                    </Col>
                </Row>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteConfirmVisible}
                title={
                    <Space style={{ color: '#ff4d4f' }}>
                        <ExclamationCircleOutlined />
                        <span>Xác nhận xóa Issue</span>
                    </Space>
                }
                onCancel={() => setDeleteConfirmVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setDeleteConfirmVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="delete"
                        danger
                        type="primary"
                        loading={deleting}
                        onClick={handleDeleteIssue}
                        icon={<DeleteOutlined />}
                    >
                        Xác nhận xóa
                    </Button>,
                ]}
                width={500}
                centered
            >
                <Alert
                    message="Cảnh báo: Hành động này không thể hoàn tác!"
                    description={
                        <div style={{ marginTop: 8 }}>
                            <p>Bạn có chắc chắn muốn xóa issue này?</p>
                            <div style={{ 
                                background: '#fafafa', 
                                padding: '12px', 
                                borderRadius: '6px',
                                marginTop: '12px',
                                border: '1px solid #f0f0f0'
                            }}>
                                <Text strong>Issue:</Text> {issueCode}
                                <br />
                                <Text strong>Tóm tắt:</Text> {issueSummary}
                            </div>
                        </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <div style={{ 
                    background: '#fff2f0', 
                    padding: '12px', 
                    borderRadius: '6px',
                    border: '1px solid #ffccc7'
                }}>
                    <Text strong style={{ color: '#ff4d4f' }}>
                        Các dữ liệu sau sẽ bị xóa vĩnh viễn:
                    </Text>
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                        <li>Tất cả assignees của issue</li>
                        <li>Tất cả watchers của issue</li>
                        <li>Tất cả comments của issue</li>
                        <li>Tất cả links liên quan đến issue</li>
                        <li>Lịch sử thay đổi của issue</li>
                        <li>Liên kết với Sprint (nếu có)</li>
                    </ul>
                </div>
            </Modal>
        </>
    );
};