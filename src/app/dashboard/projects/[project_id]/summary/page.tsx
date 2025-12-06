'use client';

import React, { use } from 'react';
import { ProjectSummary } from '../../../../../components/project-module/summary/ProjectSummary';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function SummaryPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return <ProjectSummary projectId={projectId} />;
}