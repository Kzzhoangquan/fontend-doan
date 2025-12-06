import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Select,
    InputNumber,
    Space,
    Tag,
    Spin,
    Row,
    Col,
    Button,
    message,
} from 'antd';
import {
    UserOutlined,
    TagOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { issueService, Issue, IssueType, WorkflowStatus, Employee } from '@/lib/api/services/project-module/issue.service';
import { epicService } from '@/lib/api/services/project-module/epic.service';

const { TextArea } = Input;
const { Option } = Select;

export type IssueDetail = {
    id: number;
    project_id: number;
    issue_type_id: number;
    summary: string;
    issue_code: string;
    description: string | null;
    current_status_id: number;
    reporter_id: number;
    epic_link_id: number | null;
    story_points: number | null;
    original_estimate_seconds: number | null;
    time_spent_seconds: number | null;
    resolution: string | null;
    issue_type?: {
        id: number;
        type_name: string;
    };
    reporter?: {
        id: number;
        full_name: string;
    };
    epic_link?: {
        id: number;
        epic_name: string;
    };
    project?: {
        id: number;
        project_name: string;
    };
};


type Epic = {
    id: number;
    epic_name: string;
};


type IssueEditFormProps = {
    issueId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export const IssueEditForm: React.FC<IssueEditFormProps> = ({
    issueId,
    onSuccess,
    onCancel,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [epics, setEpics] = useState<Epic[]>([]);
    const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [issue, setIssue] = useState<IssueDetail | null>(null);

    // Fetch issue details
    const fetchIssueDetail = async (id: number) => {
        try {
            setLoading(true);
            const issueData = await issueService.getById(id);
            setIssue(issueData);

            // Set form values
            form.setFieldsValue({
                summary: issueData.summary,
                description: issueData.description,
                issue_type_id: issueData.issue_type_id,
                current_status_id: issueData.current_status_id,
                reporter_id: issueData.reporter_id,
                epic_link_id: issueData.epic_link_id,
                story_points: issueData.story_points,
                original_estimate_seconds: issueData.original_estimate_seconds
                    ? Math.floor(issueData.original_estimate_seconds / 3600)
                    : null,
                resolution: issueData.resolution,
            });
        } catch (error) {
            console.error('Error fetching issue:', error);
            message.error('Không thể tải thông tin issue');
        } finally {
            setLoading(false);
        }
    };

    // Fetch reference data
    const fetchReferenceData = async () => {
        try {
            const types = await issueService.getIssueTypes(issue?.project_id || 1);
            const employees = await issueService.getProjectEmployees(issue?.project_id || 1);

            setIssueTypes(types);
            setEmployees(employees);

            if (issue?.project_id) {
                const epics = await epicService.getAll({ projectId: issue.project_id });
                setEpics(epics);

                const statuses = await issueService.getWorkflowStatuses(1, issue.project_id); // Giả sử workflowId = 1

                setStatuses(statuses);
            }
        } catch (error) {
            console.error('Error fetching reference data:', error);
            message.error('Không thể tải dữ liệu tham chiếu');
        }
    };

    // Handle form submission
    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);

            // Convert hours back to seconds
            const submitData = {
                ...values,
                original_estimate_seconds: values.original_estimate_seconds
                    ? values.original_estimate_seconds * 3600
                    : null,
            };

            await issueService.update(issueId, submitData);

            message.success('Cập nhật issue thành công!');
            onSuccess?.();
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('Error updating issue:', error);
            message.error('Không thể cập nhật issue');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (issueId) {
            fetchIssueDetail(issueId);
        }
    }, [issueId]);

    useEffect(() => {
        if (issue) {
            fetchReferenceData();
        }
    }, [issue]);

    return (
        <Spin spinning={loading}>
            {/* Project info */}
            {issue?.project && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        background: '#f5f5f5',
                        borderRadius: 6,
                    }}
                >
                    <Space>
                        <Tag color="blue">Project: {issue.project.project_name}</Tag>
                        <Tag color="purple">Issue: {issue.issue_code}</Tag>
                    </Space>
                </div>
            )}

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Summary */}
                <Form.Item
                    name="summary"
                    label="Tóm tắt"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tóm tắt' },
                        { max: 255, message: 'Tóm tắt không được vượt quá 255 ký tự' },
                    ]}
                >
                    <Input placeholder="Nhập tóm tắt issue" maxLength={255} />
                </Form.Item>

                {/* Description */}
                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
                </Form.Item>

                <Row gutter={16}>
                    {/* Issue Type */}
                    <Col span={12}>
                        <Form.Item
                            name="issue_type_id"
                            label="Loại issue"
                            rules={[{ required: true, message: 'Vui lòng chọn loại issue' }]}
                        >
                            <Select
                                placeholder="Chọn loại"
                                loading={issueTypes.length === 0}
                            >
                                {issueTypes.map((type) => (
                                    <Option key={type.id} value={type.id}>
                                        {type.type_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Status */}
                    <Col span={12}>
                        <Form.Item
                            name="current_status_id"
                            label="Trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                loading={statuses.length === 0}
                            >
                                {statuses.map((status) => (
                                    <Option key={status.id} value={status.id}>
                                        {status.status_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Reporter */}
                <Form.Item
                    name="reporter_id"
                    label="Người báo cáo"
                    rules={[{ required: true, message: 'Vui lòng chọn người báo cáo' }]}
                >
                    <Select
                        placeholder="Chọn người báo cáo"
                        showSearch
                        optionFilterProp="children"
                        loading={employees.length === 0}
                    >
                        {employees.map((emp) => (
                            <Option key={emp.id} value={emp.id}>
                                <Space>
                                    <UserOutlined />
                                    {emp.full_name}
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Epic Link */}
                <Form.Item name="epic_link_id" label="Epic">
                    <Select
                        placeholder="Chọn epic (tùy chọn)"
                        allowClear
                        loading={epics.length === 0 && issue?.project_id !== undefined}
                    >
                        {epics.map((epic) => (
                            <Option key={epic.id} value={epic.id}>
                                <Space>
                                    <TagOutlined />
                                    {epic.epic_name}
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row gutter={16}>
                    {/* Story Points */}
                    <Col span={12}>
                        <Form.Item name="story_points" label="Story Points">
                            <InputNumber
                                min={0}
                                max={100}
                                placeholder="Nhập SP"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>

                    {/* Original Estimate */}
                    <Col span={12}>
                        <Form.Item name="original_estimate_seconds" label="Ước lượng (giờ)">
                            <InputNumber
                                min={0}
                                step={0.5}
                                placeholder="Số giờ"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Resolution */}
                <Form.Item name="resolution" label="Giải pháp">
                    <Input placeholder="Nhập giải pháp (nếu có)" />
                </Form.Item>

                {/* Action Buttons */}
                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={submitting}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button onClick={onCancel}>
                            Hủy
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Spin>
    );
};