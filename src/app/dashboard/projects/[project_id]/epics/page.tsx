'use client';

import React, { use } from 'react';
import { EpicManagement } from '../../../../../components/project-module/epic/EpicManagement';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function EpicPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return <EpicManagement projectId={projectId} />;
}