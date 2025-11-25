// src/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { MENU_ITEMS, MenuItem } from '@/lib/constants/menu';
import { ROUTES } from '@/lib/constants/routes';
import { ChevronLeft, ChevronRight, ChevronDown, FolderKanban, Loader2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole, user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  
  // State để delay hiển thị text sau khi sidebar mở
  const [showText, setShowText] = useState(!isCollapsed);

  // Delay text: ẩn ngay khi collapse, hiện sau 150ms khi expand
  useEffect(() => {
    if (isCollapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => setShowText(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  // Auto expand menu có active item
  useEffect(() => {
    const keysToExpand: string[] = [];
    const findActiveParents = (items: MenuItem[], parentKeys: string[] = []) => {
      items.forEach(item => {
        const currentKeys = [...parentKeys, item.href];
        if (pathname === item.href || pathname.startsWith(item.href + '/')) {
          keysToExpand.push(...parentKeys);
        }
        if (item.children) findActiveParents(item.children, currentKeys);
      });
    };
    findActiveParents(MENU_ITEMS);
    setExpandedKeys(prev => [...new Set([...prev, ...keysToExpand])]);
  }, [pathname]);

  const toggleExpand = (key: string) => {
    if (isCollapsed) return;
    setExpandedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;
    
    // Nếu là project item, check xem pathname có bắt đầu với href không
    if (href.includes('/dashboard/projects/') && href !== '/dashboard/projects') {
      const projectIdMatch = href.match(/\/dashboard\/projects\/(\d+)/);
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        const projectBasePath = `/dashboard/projects/${projectId}`;
        return pathname.startsWith(projectBasePath);
      }
    }
    
    return false;
  };
  
  const isParentOfActive = (item: MenuItem): boolean => {
    if (isActive(item.href)) return true;
    if (item.children) return item.children.some(child => isParentOfActive(child));
    return false;
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasAnyRole(item.roles))
      .map(item => {
        // Nếu là menu "Quản lý dự án", CHỈ hiển thị danh sách projects
        if (item.href === '/dashboard/projects') {
          const projectChildren: MenuItem[] = projects.map(project => ({
            label: project.project_key,
            icon: FolderKanban,
            href: `/dashboard/projects/${project.id}/sprints`, // Link đến sprint page
            roles: item.roles, // Kế thừa roles từ parent
          }));

          return {
            ...item,
            children: projectChildren, // CHỈ có projects, không có menu con khác
          };
        }

        return {
          ...item,
          children: item.children ? filterMenuItems(item.children) : undefined,
        };
      })
      .filter(item => !item.children || item.children.length > 0);
  };

  const filteredMenuItems = useMemo(() => filterMenuItems(MENU_ITEMS), [user?.roles, projects, projectsLoading]);

  const renderMenuItem = (item: MenuItem, depth: number = 0, parentHref?: string) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.includes(item.href);
    const active = isActive(item.href);
    const parentActive = isParentOfActive(item);
    const Icon = item.icon;

    // Check if this is a project item (depth = 1 and parent is /dashboard/projects)
    const isProjectItem = depth === 1 && parentHref === '/dashboard/projects' && item.icon === FolderKanban;

    const getItemStyles = () => {
      if (active) return 'bg-blue-600 text-white shadow-md shadow-blue-600/20';
      if (parentActive && hasChildren) return 'bg-blue-50 text-blue-600';
      return 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
    };

    const getIconStyles = () => {
      if (active) return 'bg-blue-500 text-white';
      if (parentActive && hasChildren) return 'bg-blue-100 text-blue-600';
      return 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700';
    };

    const paddingLeft = isCollapsed ? 8 : 12 + depth * 16;
    const iconSize = depth === 0 ? 'w-8 h-8' : depth === 1 ? 'w-7 h-7' : 'w-6 h-6';
    const iconInnerSize = depth === 0 ? 'w-4 h-4' : 'w-3.5 h-3.5';
    const fontSize = depth === 0 ? 'text-sm' : 'text-[13px]';

    return (
      <div key={item.href}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.href)}
            style={{ paddingLeft }}
            className={`w-full flex items-center justify-between pr-3 py-2 rounded-lg transition-all duration-200 group ${getItemStyles()} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 flex items-center justify-center ${iconSize} rounded-lg transition-colors ${getIconStyles()}`}>
                <Icon className={iconInnerSize} />
              </div>
              <span 
                className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${fontSize} ${
                  showText && !isCollapsed 
                    ? 'opacity-100 max-w-[180px]' 
                    : 'opacity-0 max-w-0'
                }`}
              >
                {item.label}
              </span>
            </div>
            <ChevronDown 
              className={`flex-shrink-0 w-4 h-4 text-slate-400 transition-all duration-200 ${
                isExpanded ? 'rotate-180' : ''
              } ${showText && !isCollapsed ? 'opacity-100' : 'opacity-0 w-0'}`}
            />
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={onClose}
            style={{ paddingLeft }}
            className={`flex items-center pr-3 py-2 rounded-lg transition-all duration-200 group ${getItemStyles()} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 flex items-center justify-center ${iconSize} rounded-lg transition-colors ${getIconStyles()}`}>
                {isProjectItem ? (
                  // Project badge với 2 chữ cái
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                    {item.label.substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <Icon className={iconInnerSize} />
                )}
              </div>
              <span 
                className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${fontSize} ${
                  showText && !isCollapsed 
                    ? 'opacity-100 max-w-[180px]' 
                    : 'opacity-0 max-w-0'
                }`}
              >
                {item.label}
              </span>
            </div>
            {active && (
              <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white transition-opacity duration-200 ${
                showText && !isCollapsed ? 'opacity-100' : 'opacity-0'
              }`} />
            )}
          </Link>
        )}

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && showText && (
          <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
            depth === 0 ? 'ml-6 pl-3 border-l-2 border-slate-200' : 'ml-4 pl-2 border-l border-slate-200'
          }`}>
            {/* Nếu là menu "Quản lý dự án" */}
            {item.href === '/dashboard/projects' ? (
              <>
                {projectsLoading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-slate-400 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang tải dự án...</span>
                  </div>
                )}
                {!projectsLoading && projects.length === 0 && (
                  <div className="px-2 py-2 text-slate-400 text-xs">
                    Không có dự án
                  </div>
                )}
                {!projectsLoading && projects.length > 0 && 
                  item.children!.map(child => renderMenuItem(child, depth + 1, item.href))
                }
              </>
            ) : (
              // Render children bình thường cho menu khác
              item.children!.map(child => renderMenuItem(child, depth + 1, item.href))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-slate-200 z-40 transform transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-blue-600 border-2 border-white rounded-full items-center justify-center hover:bg-blue-700 transition-colors shadow-lg z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3 text-white" /> : <ChevronLeft className="w-3 h-3 text-white" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="space-y-1 px-2">
            {filteredMenuItems.map(item => renderMenuItem(item, 0))}
          </div>
        </nav>

        {/* Footer */}
        <div 
          className={`border-t border-slate-200 bg-slate-50 overflow-hidden transition-all duration-300 ${
            showText && !isCollapsed ? 'p-4 opacity-100' : 'p-0 h-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.roles?.[0]?.name || 'Employee'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}