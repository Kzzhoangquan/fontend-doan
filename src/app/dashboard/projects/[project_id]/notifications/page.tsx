'use client';

import React, { use } from 'react';
import { NotificationManagement } from '../../../../../components/project-module/notification/NotificationManagement';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function NotificationPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return <NotificationManagement projectId={projectId} />;
}