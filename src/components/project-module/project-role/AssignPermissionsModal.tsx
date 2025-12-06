import React, { useState } from 'react';
import { Modal, Collapse, Checkbox, message, Space, Alert, Tag } from 'antd';
import { AssignPermissionDto, Permission } from '@/lib/api/services/project-module/project-role.service';
import { PERMISSION_GROUPS } from '@/lib/api/services/project-module/permissions';

const { Panel } = Collapse;

interface AssignPermissionsModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    roleName: string;
    existingPermissions: Permission[];
    onSubmit: (permissions: AssignPermissionDto[]) => Promise<void>;
    onRemove: (actionKey: string) => Promise<void>;
}

export const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    roleName,
    existingPermissions,
    onSubmit,
    onRemove,
}) => {
    const [loading, setLoading] = useState(false);
    const [processingPermissions, setProcessingPermissions] = useState<Set<string>>(new Set());

    const handlePermissionChange = async (actionKey: string, checked: boolean) => {
        const isCurrentlyAssigned = isPermissionExist(actionKey);

        // Prevent multiple simultaneous operations on the same permission
        if (processingPermissions.has(actionKey)) {
            return;
        }

        // Mark permission as processing
        setProcessingPermissions((prev) => new Set(prev).add(actionKey));

        try {
            if (checked && !isCurrentlyAssigned) {
                // Assign permission immediately
                await onSubmit([{
                    action_key: actionKey,
                    recipient_type: 'ROLE',
                }]);
                message.success(`Permission assigned successfully`);
            } else if (!checked && isCurrentlyAssigned) {
                // Remove permission immediately
                await onRemove(actionKey);
                message.success(`Permission removed successfully`);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || `Failed to ${checked ? 'assign' : 'remove'} permission`);
            // Error will cause the checkbox to revert since existingPermissions won't change
        } finally {
            // Remove from processing set
            setProcessingPermissions((prev) => {
                const newSet = new Set(prev);
                newSet.delete(actionKey);
                return newSet;
            });
        }
    };

    const isPermissionExist = (actionKey: string) => {
        return existingPermissions.some(
            (p) => p.action_key === actionKey && p.recipient_type === 'ROLE'
        );
    };

    const isProcessing = (actionKey: string) => {
        return processingPermissions.has(actionKey);
    };

    const getAssignedCount = () => {
        return existingPermissions.filter(p => p.recipient_type === 'ROLE').length;
    };

    return (
        <Modal
            title={`Manage Permissions for "${roleName}"`}
            open={visible}
            onCancel={onCancel}
            footer={null} // Remove footer since we don't need Save button anymore
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
            <Alert
                message="Instant Permission Management"
                description={
                    <div>
                        <div>✓ <strong>Check</strong> to assign a permission (instant)</div>
                        <div>✗ <strong>Uncheck</strong> to remove a permission (instant)</div>
                        <div style={{ marginTop: 8 }}>
                            All changes are applied immediately.
                        </div>
                    </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Tag color="blue">Assigned: {getAssignedCount()}</Tag>
                    {processingPermissions.size > 0 && (
                        <Tag color="orange">Processing: {processingPermissions.size}</Tag>
                    )}
                </Space>
            </div>

            <Collapse defaultActiveKey={['PROJECT_ADMINISTRATION']} ghost>
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                    <Panel
                        header={
                            <span style={{ fontWeight: 500, fontSize: 14 }}>
                                {group.name} ({group.permissions.length})
                            </span>
                        }
                        key={groupKey}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {group.permissions.map((permission) => {
                                const isChecked = isPermissionExist(permission.key);
                                const isLoadingThis = isProcessing(permission.key);

                                return (
                                    <div
                                        key={permission.key}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: 4,
                                            backgroundColor: isChecked
                                                ? '#f6ffed' // Light green for assigned
                                                : '#fafafa',
                                            opacity: isLoadingThis ? 0.6 : 1,
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                            <Checkbox
                                                checked={isChecked}
                                                disabled={isLoadingThis}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        permission.key,
                                                        e.target.checked
                                                    )
                                                }
                                            >
                                                <strong>{permission.name}</strong>
                                                {isChecked && (
                                                    <Tag
                                                        color="success"
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Assigned
                                                    </Tag>
                                                )}
                                                {isLoadingThis && (
                                                    <Tag
                                                        color="processing"
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Processing...
                                                    </Tag>
                                                )}
                                            </Checkbox>

                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: '#8c8c8c',
                                                    marginLeft: 24,
                                                }}
                                            >
                                                {permission.description}
                                            </div>
                                        </Space>
                                    </div>
                                );
                            })}
                        </Space>
                    </Panel>
                ))}
            </Collapse>
        </Modal>
    );
};