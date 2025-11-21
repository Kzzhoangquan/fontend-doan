import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { issueService, IssueType, WorkflowStatus } from '@/lib/api/services/issue.service';

const { TextArea } = Input;
const { Option } = Select;

interface CreateIssueModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: (issue: any) => void;
	projectId: number; // Thêm projectId để lọc data
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
	visible,
	onClose,
	onSuccess,
	projectId,
}) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
	const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(false);
	const [loadingStatuses, setLoadingStatuses] = useState(false);

	// Fetch Issue Types
	const fetchIssueTypes = async () => {
		try {
			setLoadingTypes(true);
			const data = await issueService.getIssueTypes();
			setIssueTypes(data);
		} catch (error) {
			console.error('Error fetching issue types:', error);
			message.error('Không thể tải danh sách loại issue');
		} finally {
			setLoadingTypes(false);
		}
	};

	// Fetch Workflow Statuses
	const fetchStatuses = async (workflowId: number) => {
		try {
			setLoadingStatuses(true);
			const data = await issueService.getWorkflowStatuses(workflowId);
			setStatuses(data);
		} catch (error) {
			console.error('Error fetching statuses:', error);
			message.error('Không thể tải danh sách trạng thái');
		} finally {
			setLoadingStatuses(false);
		}
	};

	// Load data when modal opens
	useEffect(() => {
		if (visible) {
			fetchIssueTypes();
			// Thay workflowId = 1 bằng workflowId thực tế từ project
			fetchStatuses(1);
		}
	}, [visible]);

	const handleSubmit = async () => {
		try {
			setLoading(true);
			const values = await form.validateFields();

			// Prepare data for API
			const createData = {
				project_id: projectId,
				issue_type_id: values.issue_type_id,
				current_status_id: values.current_status_id,
				summary: values.summary,
				reporter_id: 1, // Thay bằng user hiện tại
				issue_code: '', // Issue code sẽ được tạo tự động ở backend
			};

			// Call API to create issue
			const data = await issueService.create(createData);

			message.success('Tạo issue thành công!');
			onSuccess(data);
			form.resetFields();
			onClose();
		} catch (error) {
			console.error('Error creating issue:', error);
			message.error('Không thể tạo issue');
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	return (
		<Modal
			title="Create Issue"
			open={visible}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={loading}
			okText="Create"
			cancelText="Cancel"
			width={600}
			destroyOnClose
		>
			<Form
				form={form}
				layout="vertical"
				preserve={false}
			>
				{/* Summary */}
				<Form.Item
					label="Summary"
					name="summary"
					rules={[
						{ required: true, message: 'Please input the summary!' },
						{ max: 255, message: 'Summary cannot exceed 255 characters' },
					]}
				>
					<TextArea
						placeholder="Enter issue summary"
						rows={3}
						maxLength={255}
						showCount
					/>
				</Form.Item>

				{/* Issue Type */}
				<Form.Item
					label="Type"
					name="issue_type_id"
					rules={[{ required: true, message: 'Please select the type!' }]}
				>
					<Select
						placeholder="Select issue type"
						loading={loadingTypes}
					>
						{issueTypes.map((type) => (
							<Option key={type.id} value={type.id}>
								{type.type_name}
							</Option>
						))}
					</Select>
				</Form.Item>

				{/* Status */}
				<Form.Item
					label="Status"
					name="current_status_id"
					rules={[{ required: true, message: 'Please select the status!' }]}
				>
					<Select
						placeholder="Select status"
						loading={loadingStatuses}
					>
						{statuses.map((status) => (
							<Option key={status.id} value={status.id}>
								{status.status_name}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};