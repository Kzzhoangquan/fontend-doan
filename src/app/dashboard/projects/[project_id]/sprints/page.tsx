'use client';

import React, { use } from 'react';
import { SprintBacklog } from '../../../../../components/project-module/sprint/SprintBacklog';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function SprintPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return <SprintBacklog projectId={projectId} />;
}