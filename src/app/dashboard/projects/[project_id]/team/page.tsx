'use client';

import React, { use } from 'react';
import { TeamManagement } from '../../../../../components/project-module/team/TeamManagement';

type PageProps = {
    params: Promise<{
        project_id: string;
    }>;
};

export default function TeamPage({ params }: PageProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return <TeamManagement projectId={projectId} />;
}