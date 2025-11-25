'use client';

import { use } from 'react';
import { BoardComponent } from '../../../../../../components/project-module/issue/BoardComponent';

type PageProps = {
    params: Promise<{
        project_id: string;
        board_id: string;
    }>;
};

export default function BoardPage({ params }: PageProps) {
    const { project_id, board_id } = use(params);
    const projectId = parseInt(project_id);
    const boardId = parseInt(board_id);

    return <BoardComponent projectId = {projectId} boardId = {boardId} />;
}