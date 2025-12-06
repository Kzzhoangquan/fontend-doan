// src/hooks/useProjects.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService, Project } from '@/lib/api/services/project-module/project.service';

interface UseProjectsReturn {
  projects: Project[]; // ✅ Đổi từ SidebarProject[] thành Project[]
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]); // ✅ Đổi type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ Dùng getAll() thay vì getForSidebar() để có đầy đủ data
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}