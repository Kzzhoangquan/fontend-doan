import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    message,
    Space,
} from 'antd';
import { FlagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { epicService, Epic, CreateEpicDto, UpdateEpicDto } from '@/lib/api/services/project-module/epic.service';
import { Project } from '@/lib/api/services/project-module/project.service';

const { TextArea } = Input;
const { Option } = Select;

type EpicFormModalProps = {
    visible: boolean;
    epic: Epic | null;
    projects: Project[];
    onClose: () => void;
    onSuccess: () => void;
};

export const EpicFormModal: React.FC<EpicFormModalProps> = ({
    visible,
    epic,
    projects,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const isEditing = !!epic;

    useEffect(() => {
        if (visible && epic) {
            form.setFieldsValue({
                project_id: epic.project_id,
                epic_name: epic.epic_name,
                goal: epic.goal,
                status: epic.status,
                start_date: epic.start_date ? dayjs(epic.start_date) : null,
                due_date: epic.due_date ? dayjs(epic.due_date) : null,
            });
        } else if (visible) {
            form.resetFields();
        }
    }, [visible, epic, form]);

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);

            const submitData: CreateEpicDto | UpdateEpicDto = {
                ...values,
                start_date: values.start_date
                    ? values.start_date.format('YYYY-MM-DD')
                    : null,
                due_date: values.due_date
                    ? values.due_date.format('YYYY-MM-DD')
                    : null,
            };

            if (isEditing) {
                await epicService.update(epic.id, submitData);
                message.success('Đã cập nhật epic');
            } else {
                await epicService.create(submitData as CreateEpicDto);
                message.success('Đã tạo epic mới');
            }

            form.resetFields();
            onSuccess();
        } catch (error: any) {
            console.error('Error saving epic:', error);
            if (error.response?.status === 400) {
                message.error(error.response.data.message || 'Dữ liệu không hợp lệ');
            } else {
                message.error('Không thể lưu epic');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            open={visible}
            title={
                <Space>
                    <FlagOutlined />
                    <span>{isEditing ? 'Edit Epic' : 'Create New Epic'}</span>
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
                {/* Project */}
                <Form.Item
                    name="project_id"
                    label="Project"
                    rules={[{ required: true, message: 'Please select a project' }]}
                >
                    <Select
                        placeholder="Select project"
                        showSearch
                        optionFilterProp="children"
                    >
                        {projects.map((project) => (
                            <Option key={project.id} value={project.id}>
                                {project.project_name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Epic Name */}
                <Form.Item
                    name="epic_name"
                    label="Epic Name"
                    rules={[
                        { required: true, message: 'Please enter epic name' },
                        { max: 255, message: 'Epic name cannot exceed 255 characters' },
                    ]}
                >
                    <Input placeholder="Enter epic name" maxLength={255} />
                </Form.Item>

                {/* Goal */}
                <Form.Item name="goal" label="Goal">
                    <TextArea
                        rows={3}
                        placeholder="Enter epic goal or description"
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                {/* Status */}
                <Form.Item name="status" label="Status">
                    <Select placeholder="Select status" allowClear>
                        <Option value="Planning">Planning</Option>
                        <Option value="In Progress">In Progress</Option>
                        <Option value="On Hold">On Hold</Option>
                        <Option value="Done">Done</Option>
                        <Option value="Cancelled">Cancelled</Option>
                    </Select>
                </Form.Item>

                {/* Dates */}
                <Space style={{ width: '100%' }} size="large">
                    <Form.Item
                        name="start_date"
                        label="Start Date"
                        style={{ flex: 1, marginBottom: 0 }}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="due_date"
                        label="Due Date"
                        style={{ flex: 1, marginBottom: 0 }}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('start_date');
                                    if (!value || !startDate) {
                                        return Promise.resolve();
                                    }
                                    if (value.isBefore(startDate)) {
                                        return Promise.reject(
                                            new Error('Due date must be after start date')
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Space>

                {/* Footer Buttons */}
                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
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