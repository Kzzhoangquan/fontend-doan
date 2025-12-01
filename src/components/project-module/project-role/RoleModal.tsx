import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { CreateRoleDto, UpdateRoleDto } from '@/lib/api/services/project-module/project-role.service';
import { ProjectRole } from '@/lib/api/services/project-module/project-role.service';

interface RoleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    projectId: number;
    role?: ProjectRole | null;
    onSubmit: (data: CreateRoleDto | UpdateRoleDto) => Promise<void>;
}

export const RoleModal: React.FC<RoleModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    role,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (visible) {
            if (role) {
                // Edit mode
                form.setFieldsValue({
                    role_name: role.role_name,
                    role_description: role.role_description,
                });
            } else {
                // Create mode
                form.resetFields();
            }
        }
    }, [visible, role, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await onSubmit(values);
            
            message.success(role ? 'Role updated successfully' : 'Role created successfully');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) {
                // Validation error
                return;
            }
            message.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const isDefaultRole = role && ['Administrator', 'Member', 'Viewer'].includes(role.role_name);

    return (
        <Modal
            title={role ? 'Edit Role' : 'Create New Role'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={role ? 'Update' : 'Create'}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item
                    label="Role Name"
                    name="role_name"
                    rules={[
                        { required: true, message: 'Please enter role name' },
                        { min: 2, message: 'Role name must be at least 2 characters' },
                        { max: 50, message: 'Role name must not exceed 50 characters' },
                    ]}
                >
                    <Input 
                        placeholder="e.g., Developer, QA Tester, Designer"
                        disabled={isDefaultRole ?? false}
                    />
                </Form.Item>

                {isDefaultRole && (
                    <div style={{ marginTop: -16, marginBottom: 16, color: '#faad14', fontSize: 12 }}>
                        ⚠️ Cannot rename default roles
                    </div>
                )}

                <Form.Item
                    label="Description"
                    name="role_description"
                    rules={[
                        { max: 200, message: 'Description must not exceed 200 characters' },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Describe the responsibilities of this role"
                        rows={4}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};