import React, { useEffect, useState } from 'react';
import {
    Select,
    Space,
    Typography,
    message,
    Spin,
    Tooltip,
    Tag,
    Input,
    Button,
    Divider,
    Empty,
} from 'antd';
import {
    LinkOutlined,
    CloseOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { issueService, IssueLinksData } from '@/lib/api/services/issue.service';

const { Option } = Select;
const { Text } = Typography;

type LinkedIssue = {
    id: number;
    link_type: string;
    issue: {
        id: number;
        issue_code: string;
        summary: string;
        issue_type?: string;
        current_status_id: number;
    };
};


type Issue = {
    id: number;
    issue_code: string;
    summary: string;
    issue_type?: {
        type_name: string;
    };
};

type IssueLinksProps = {
    issueId: number;
    projectId?: number;
};

// Link type labels
const LINK_TYPE_LABELS: Record<string, { outgoing: string; incoming: string; color: string }> = {
    blocks: { outgoing: 'Blocks', incoming: 'Blocked by', color: 'red' },
    is_blocked_by: { outgoing: 'Blocked by', incoming: 'Blocks', color: 'red' },
    relates_to: { outgoing: 'Relates to', incoming: 'Relates to', color: 'blue' },
    duplicates: { outgoing: 'Duplicates', incoming: 'Duplicated by', color: 'orange' },
    is_duplicated_by: { outgoing: 'Duplicated by', incoming: 'Duplicates', color: 'orange' },
    causes: { outgoing: 'Causes', incoming: 'Caused by', color: 'purple' },
    is_caused_by: { outgoing: 'Caused by', incoming: 'Causes', color: 'purple' },
    parent_of: { outgoing: 'Parent of', incoming: 'Child of', color: 'green' },
    child_of: { outgoing: 'Child of', incoming: 'Parent of', color: 'green' },
};

export const IssueLinks: React.FC<IssueLinksProps> = ({ issueId, projectId = 1 }) => {
    const [links, setLinks] = useState<IssueLinksData>({ outgoing: [], incoming: [] });
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [availableIssues, setAvailableIssues] = useState<Issue[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLinkType, setSelectedLinkType] = useState<string>('relates_to');
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

    // Fetch links
    const fetchLinks = async () => {
        try {
            setLoading(true);
            const data = await issueService.getLinks(issueId);
            setLinks(data);
        } catch (error) {
            console.error('Error fetching links:', error);
            message.error('Không thể tải danh sách links');
        } finally {
            setLoading(false);
        }
    };

    // Search issues
    const searchIssues = async (term: string) => {
        if (!term || term.length < 2) {
            setAvailableIssues([]);
            return;
        }

        try {
            setSearchLoading(true);
            const data = await issueService.getAll({ search: term, projectId });

            // Filter out current issue and already linked issues
            const linkedIssueIds = [
                ...links.outgoing.map((l) => l.issue.id),
                ...links.incoming.map((l) => l.issue.id),
                issueId,
            ];
            const filtered = data.filter(
                (issue: Issue) => !linkedIssueIds.includes(issue.id)
            );
            setAvailableIssues(filtered);
        } catch (error) {
            console.error('Error searching issues:', error);
            message.error('Không thể tìm kiếm issues');
        } finally {
            setSearchLoading(false);
        }
    };

    // Add link
    const handleAddLink = async () => {
        if (!selectedIssueId) {
            message.warning('Vui lòng chọn issue để link');
            return;
        }

        try {
            setAdding(true);
            await issueService.createLink(issueId, selectedIssueId, selectedLinkType);
            message.success('Đã thêm link');
            setSelectedIssueId(null);
            setSearchTerm('');
            setAvailableIssues([]);
            fetchLinks();
        } catch (error: any) {
            console.error('Error adding link:', error);
            if (error.response?.status === 400) {
                message.warning(error.response.data.message || 'Link này đã tồn tại');
            } else {
                message.error('Không thể thêm link');
            }
        } finally {
            setAdding(false);
        }
    };

    // Remove link
    const handleRemoveLink = async (linkId: number) => {
        try {
            await issueService.deleteLink(issueId, linkId);
            message.success('Đã xóa link');
            fetchLinks();
        } catch (error) {
            console.error('Error removing link:', error);
            message.error('Không thể xóa link');
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchLinks();
        }
    }, [issueId]);

    const renderLink = (link: LinkedIssue, direction: 'outgoing' | 'incoming') => {
        const linkConfig = LINK_TYPE_LABELS[link.link_type] || {
            outgoing: link.link_type,
            incoming: link.link_type,
            color: 'default',
        };
        const label = direction === 'outgoing' ? linkConfig.outgoing : linkConfig.incoming;

        return (
            <div
                key={link.id}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: 4,
                    marginBottom: 8,
                    transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e6f7ff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                }}
            >
                <Space direction="vertical" size={2} style={{ flex: 1 }}>
                    <Space>
                        <Tag color={linkConfig.color}>{label}</Tag>
                        <Text strong style={{ fontSize: 13 }}>
                            {link.issue.issue_code}
                        </Text>
                        {link.issue.issue_type && (
                            <Tag style={{ fontSize: 11 }}>{link.issue.issue_type}</Tag>
                        )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {link.issue.summary}
                    </Text>
                </Space>
                <Tooltip title="Xóa link">
                    <CloseOutlined
                        style={{
                            cursor: 'pointer',
                            color: '#ff4d4f',
                            fontSize: 12,
                            marginLeft: 8,
                        }}
                        onClick={() => handleRemoveLink(link.id)}
                    />
                </Tooltip>
            </div>
        );
    };

    return (
        <div>
            <Spin spinning={loading}>
                {/* Add Link Section */}
                <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>
                        <PlusOutlined /> Thêm link mới
                    </Text>

                    {/* Link Type Select */}
                    <Select
                        style={{ width: '100%', marginBottom: 8 }}
                        value={selectedLinkType}
                        onChange={setSelectedLinkType}
                    >
                        <Option value="relates_to">Relates to</Option>
                        <Option value="blocks">Blocks</Option>
                        <Option value="is_blocked_by">Is blocked by</Option>
                        <Option value="duplicates">Duplicates</Option>
                        <Option value="is_duplicated_by">Is duplicated by</Option>
                        <Option value="causes">Causes</Option>
                        <Option value="is_caused_by">Is caused by</Option>
                        <Option value="parent_of">Parent of</Option>
                        <Option value="child_of">Child of</Option>
                    </Select>

                    {/* Issue Search */}
                    <Input
                        placeholder="Tìm issue theo code hoặc summary..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            searchIssues(e.target.value);
                        }}
                        style={{ marginBottom: 8 }}
                    />

                    {/* Search Results */}
                    {searchLoading ? (
                        <div style={{ textAlign: 'center', padding: 8 }}>
                            <Spin size="small" />
                        </div>
                    ) : availableIssues.length > 0 ? (
                        <div
                            style={{
                                maxHeight: 150,
                                overflowY: 'auto',
                                marginBottom: 8,
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                            }}
                        >
                            {availableIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    style={{
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        background:
                                            selectedIssueId === issue.id ? '#e6f7ff' : 'white',
                                        borderBottom: '1px solid #f0f0f0',
                                    }}
                                    onClick={() => setSelectedIssueId(issue.id)}
                                >
                                    <Space>
                                        <Text strong style={{ fontSize: 12 }}>
                                            {issue.issue_code}
                                        </Text>
                                        {issue.issue_type && (
                                            <Tag style={{ fontSize: 11 }}>
                                                {issue.issue_type.type_name}
                                            </Tag>
                                        )}
                                    </Space>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {issue.summary}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddLink}
                        loading={adding}
                        disabled={!selectedIssueId}
                        block
                    >
                        Thêm link
                    </Button>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Existing Links */}
                <div>
                    {links.outgoing.length === 0 && links.incoming.length === 0 ? (
                        <Empty description="Chưa có link nào" style={{ marginTop: 40 }} />
                    ) : (
                        <>
                            {/* Outgoing Links */}
                            {links.outgoing.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        <LinkOutlined /> Links từ issue này ({links.outgoing.length})
                                    </Text>
                                    {links.outgoing.map((link) => renderLink(link, 'outgoing'))}
                                </div>
                            )}

                            {/* Incoming Links */}
                            {links.incoming.length > 0 && (
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        <LinkOutlined /> Links đến issue này ({links.incoming.length})
                                    </Text>
                                    {links.incoming.map((link) => renderLink(link, 'incoming'))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Spin>
        </div>
    );
};