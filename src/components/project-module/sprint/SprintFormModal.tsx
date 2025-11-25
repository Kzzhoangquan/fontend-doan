import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Select,
    Button,
    message,
    Space,
} from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Sprint } from './sprint.types';
import { sprintService, CreateSprintDto, UpdateSprintDto } from '@/lib/api/services/sprint.service';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

type SprintFormModalProps = {
    visible: boolean;
    sprint: Sprint | null;
    projectId: number;
    onClose: () => void;
    onSuccess: () => void;
};

export const SprintFormModal: React.FC<SprintFormModalProps> = ({
    visible,
    sprint,
    projectId,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const isEditing = !!sprint;

    useEffect(() => {
        if (visible && sprint) {
            form.setFieldsValue({
                sprint_name: sprint.sprint_name,
                goal: sprint.goal,
                dateRange: sprint.start_date && sprint.end_date 
                    ? [dayjs(sprint.start_date), dayjs(sprint.end_date)]
                    : null,
                duration_days: sprint.duration_days,
                status: sprint.status,
            });
        } else if (visible) {
            form.resetFields();
            form.setFieldValue('status', 'planning');
        }
    }, [visible, sprint, form]);

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);

            const submitData: CreateSprintDto | UpdateSprintDto = {
                project_id: projectId,
                sprint_name: values.sprint_name,
                goal: values.goal,
                start_date: values.dateRange?.[0]?.format('YYYY-MM-DD') || null,
                end_date: values.dateRange?.[1]?.format('YYYY-MM-DD') || null,
                duration_days: values.duration_days,
                status: values.status,
            };

            if (isEditing) {
                await sprintService.update(sprint.id, submitData);
                message.success('Đã cập nhật sprint');
            } else {
                await sprintService.create(submitData as CreateSprintDto);
                message.success('Đã tạo sprint mới');
            }

            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error('Error saving sprint:', error);
            if (error.response?.status === 400) {
                message.error(error.response.data.message || 'Dữ liệu không hợp lệ');
            } else {
                message.error('Không thể lưu sprint');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Auto-calculate duration when dates change
    const handleDateChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            const duration = dates[1].diff(dates[0], 'days');
            form.setFieldValue('duration_days', duration);
        }
    };

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <RocketOutlined />
                    <span>{isEditing ? 'Edit Sprint' : 'Create New Sprint'}</span>
                </Space>
            }
            onCancel={handleCancel}
            width={600}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: 16 }}
            >
                {/* Sprint Name */}
                <Form.Item
                    name="sprint_name"
                    label="Sprint Name"
                    rules={[
                        { required: true, message: 'Please enter sprint name' },
                        { max: 255, message: 'Sprint name cannot exceed 255 characters' },
                    ]}
                >
                    <Input placeholder="e.g., Sprint 1, Alpha Release" maxLength={255} />
                </Form.Item>

                {/* Goal */}
                <Form.Item name="goal" label="Sprint Goal">
                    <TextArea
                        rows={3}
                        placeholder="What do you want to achieve in this sprint?"
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                {/* Date Range */}
                <Form.Item name="dateRange" label="Sprint Duration">
                    <RangePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        onChange={handleDateChange}
                    />
                </Form.Item>

                {/* Duration Days */}
                <Form.Item
                    name="duration_days"
                    label="Duration (Days)"
                    help="Auto-calculated from dates or enter manually"
                >
                    <InputNumber
                        min={1}
                        max={365}
                        placeholder="e.g., 14"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {/* Status */}
                <Form.Item name="status" label="Status">
                    <Select placeholder="Select status">
                        <Option value="planning">Planning</Option>
                        <Option value="active">Active</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="closed">Closed</Option>
                    </Select>
                </Form.Item>

                {/* Footer Buttons */}
                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ float: 'right' }}>
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};