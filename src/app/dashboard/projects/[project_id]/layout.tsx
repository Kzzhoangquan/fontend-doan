// app/dashboard/projects/[project_id]/layout.tsx
'use client';

import React, { use } from 'react';
import { ProjectHeader } from '../../../../components/project-module/ProjectHeader';

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{
        project_id: string;
    }>;
};

export default function ProjectLayout({ children, params }: LayoutProps) {
    const { project_id } = use(params);
    const projectId = parseInt(project_id);

    return (
        <div>
            {/* Project Header - Chỉ render 1 lần, không reload khi chuyển trang */}
            <ProjectHeader projectId={projectId} />

            {/* Children pages (sprint, epics, boards) */}
            {children}
        </div>
    );
}