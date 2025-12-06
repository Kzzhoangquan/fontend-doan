// src/components/project-module/CreateProjectModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Spin, Alert } from 'antd';
import { projectService } from '@/lib/api/services/project-module/project.service';
import { employeeService } from '@/lib/api/services/project-module/employee.service';

const { TextArea } = Input;
const { Option } = Select;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SchemeOption {
  id: number;
  scheme_name: string;
  scheme_description?: string;
  is_default?: boolean;
}

interface Schemes {
  permissionSchemes: SchemeOption[];
  notificationSchemes: SchemeOption[];
  workflowSchemes: SchemeOption[];
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [schemes, setSchemes] = useState<Schemes>({
    permissionSchemes: [],
    notificationSchemes: [],
    workflowSchemes: [],
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load schemes và employees khi modal mở
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      setSchemesLoading(true);
      setEmployeesLoading(true);

      // Load schemes và employees song song
      const [schemesData, employeesData] = await Promise.all([
        projectService.getAllSchemes(),
        employeeService.getAllEmployees(),
      ]);

      setSchemes(schemesData);
      setEmployees(employeesData);

      // Pre-fill form với scheme đầu tiên trong danh sách
      if (schemesData.permissionSchemes.length > 0) {
        // Ưu tiên scheme có is_default = true, không có thì lấy scheme đầu tiên
        const defaultPermission = schemesData.permissionSchemes.find(s => s.is_default) 
          || schemesData.permissionSchemes[0];
        form.setFieldValue('permission_scheme_id', defaultPermission.id);
      }
      
      if (schemesData.notificationSchemes.length > 0) {
        form.setFieldValue('notification_scheme_id', schemesData.notificationSchemes[0].id);
      }
      
      if (schemesData.workflowSchemes.length > 0) {
        form.setFieldValue('workflow_scheme_id', schemesData.workflowSchemes[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setSchemesLoading(false);
      setEmployeesLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const response = await projectService.create({
        project_key: values.project_key.toUpperCase(),
        project_name: values.project_name,
        project_description: values.project_description || null,
        lead_employee_id: values.lead_employee_id,
        permission_scheme_id: values.permission_scheme_id,
        notification_scheme_id: values.notification_scheme_id,
        workflow_scheme_id: values.workflow_scheme_id,
      });

      message.success(
        <div>
          <div>Dự án <strong>{response.project_key}</strong> đã được tạo thành công!</div>
          {response.creator_assignment && (
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Bạn đã được gán quyền <strong>{response.creator_assignment.role}</strong>
            </div>
          )}
        </div>
      );

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      if (error.response?.status === 409) {
        message.error('Mã dự án đã tồn tại. Vui lòng chọn mã khác.');
      } else {
        message.error(error.response?.data?.message || 'Không thể tạo dự án. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const isFormLoading = schemesLoading || employeesLoading;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📁</span>
          <span>Tạo dự án mới</span>
        </div>
      }
      open={open}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Tạo dự án"
      cancelText="Hủy"
      confirmLoading={loading}
      width={600}
      maskClosable={false}
    >
      {isFormLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#999' }}>Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <Alert
            message="Lưu ý"
            description="Khi tạo dự án, hệ thống sẽ tự động sao chép các schemes đã chọn. Bạn sẽ được gán quyền Admin trong dự án và có thể chỉnh sửa schemes mà không ảnh hưởng đến các dự án khác."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Project Key */}
            <Form.Item
              name="project_key"
              label="Mã dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập mã dự án' },
                { min: 2, message: 'Mã dự án phải có ít nhất 2 ký tự' },
                { max: 10, message: 'Mã dự án không được quá 10 ký tự' },
                { 
                  pattern: /^[A-Z0-9]+$/, 
                  message: 'Mã dự án chỉ được chứa chữ cái in hoa và số' 
                },
              ]}
              tooltip="Mã ngắn gọn để định danh dự án (VD: PROJ, ERP, WEB)"
            >
              <Input
                placeholder="VD: PROJ"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  form.setFieldValue('project_key', e.target.value.toUpperCase());
                }}
              />
            </Form.Item>

            {/* Project Name */}
            <Form.Item
              name="project_name"
              label="Tên dự án"
              rules={[
                { required: true, message: 'Vui lòng nhập tên dự án' },
                { max: 255, message: 'Tên dự án không được quá 255 ký tự' },
              ]}
            >
              <Input placeholder="VD: Hệ thống quản lý ERP" maxLength={255} />
            </Form.Item>

            {/* Project Description */}
            <Form.Item
              name="project_description"
              label="Mô tả dự án"
            >
              <TextArea
                rows={3}
                placeholder="Mô tả ngắn về dự án..."
                maxLength={1000}
                showCount
              />
            </Form.Item>

            {/* Lead Employee */}
            <Form.Item
              name="lead_employee_id"
              label="Trưởng dự án"
              rules={[{ required: true, message: 'Vui lòng chọn trưởng dự án' }]}
              tooltip="Người chịu trách nhiệm chính cho dự án"
            >
              <Select
                showSearch
                placeholder="Chọn trưởng dự án"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={Array.isArray(employees) ? employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.full_name} (${emp.email})`,
                })) : []}
                loading={employeesLoading}
              />
            </Form.Item>

            {/* Divider */}
            <div style={{ 
              margin: '24px 0', 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: 6 
            }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Cấu hình Schemes</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                Các schemes sẽ được sao chép riêng cho dự án này
              </div>
            </div>

            {/* Permission Scheme */}
            <Form.Item
              name="permission_scheme_id"
              label="Permission Scheme"
              rules={[{ required: true, message: 'Vui lòng chọn permission scheme' }]}
              tooltip="Định nghĩa quyền hạn và vai trò trong dự án"
            >
              <Select
                placeholder="Chọn permission scheme"
                loading={schemesLoading}
                optionLabelProp="label"
              >
                {schemes.permissionSchemes.map(scheme => (
                  <Option
                    key={scheme.id}
                    value={scheme.id}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {scheme.scheme_name}
                        {scheme.is_default && (
                          <span style={{ 
                            fontSize: 10, 
                            padding: '2px 6px', 
                            background: '#1890ff', 
                            color: 'white', 
                            borderRadius: 4 
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                    }
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {scheme.scheme_name}
                        {scheme.is_default && (
                          <span style={{ 
                            marginLeft: 8,
                            fontSize: 10, 
                            padding: '2px 6px', 
                            background: '#1890ff', 
                            color: 'white', 
                            borderRadius: 4 
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      {scheme.scheme_description && (
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {scheme.scheme_description}
                        </div>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Notification Scheme */}
            <Form.Item
              name="notification_scheme_id"
              label="Notification Scheme"
              rules={[{ required: true, message: 'Vui lòng chọn notification scheme' }]}
              tooltip="Cấu hình email thông báo cho các sự kiện"
            >
              <Select
                placeholder="Chọn notification scheme"
                loading={schemesLoading}
                optionLabelProp="label"
              >
                {schemes.notificationSchemes.map(scheme => (
                  <Option
                    key={scheme.id}
                    value={scheme.id}
                    label={scheme.scheme_name}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{scheme.scheme_name}</div>
                      {scheme.scheme_description && (
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {scheme.scheme_description}
                        </div>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Workflow Scheme */}
            <Form.Item
              name="workflow_scheme_id"
              label="Workflow Scheme"
              rules={[{ required: true, message: 'Vui lòng chọn workflow scheme' }]}
              tooltip="Định nghĩa quy trình làm việc cho các loại issue"
            >
              <Select
                placeholder="Chọn workflow scheme"
                loading={schemesLoading}
                optionLabelProp="label"
              >
                {schemes.workflowSchemes.map(scheme => (
                  <Option
                    key={scheme.id}
                    value={scheme.id}
                    label={scheme.scheme_name}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{scheme.scheme_name}</div>
                      {scheme.scheme_description && (
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {scheme.scheme_description}
                        </div>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};