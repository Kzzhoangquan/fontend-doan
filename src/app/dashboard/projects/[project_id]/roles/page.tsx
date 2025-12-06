'use client';

import { RoleManagement } from '@/components/project-module/project-role/RoleManagement';
import { use } from 'react';

interface PageProps {
    params: Promise<{
        project_id: string;
    }>;
}

export default function RoleManagementPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id, 10);

    return <RoleManagement projectId={projectId} />;
}