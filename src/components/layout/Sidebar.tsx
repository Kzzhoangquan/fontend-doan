'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import { MENU_ITEMS } from '@/lib/constants/menu';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole } = useRole();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    if (isCollapsed) return;
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: typeof MENU_ITEMS[0], depth = 0) => {
    if (!hasAnyRole(item.roles)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);

    return (
      <div key={item.label}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
              active
                ? 'bg-linear-to-r from-(--color-primary-blue) to-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            } ${isCollapsed ? 'justify-center' : ''}`}
            style={{ paddingLeft: isCollapsed ? '16px' : `${depth * 12 + 16}px` }}
            title={isCollapsed ? item.label : ''}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <item.icon className="w-5 h-5 shrink-0" />
              <span 
                className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isCollapsed 
                    ? 'opacity-0 w-0' 
                    : 'opacity-100 w-auto delay-100'
                }`}
                style={{ minWidth: isCollapsed ? '0' : '120px' }}
              >
                {item.label}
              </span>
            </div>
            {!isCollapsed && (
              <div className={`transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto delay-100'
              }`}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-4 py-3 rounded-lg transition-all group ${
              active
                ? 'bg-linear-to-r from-(--color-primary-blue) to-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
            style={{ paddingLeft: isCollapsed ? '16px' : `${depth * 12 + 16}px` }}
            title={isCollapsed ? item.label : ''}
            prefetch={true}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span 
              className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed 
                  ? 'opacity-0 w-0' 
                  : 'opacity-100 w-auto delay-100'
              }`}
              style={{ minWidth: isCollapsed ? '0' : '120px' }}
            >
              {item.label}
            </span>
          </Link>
        )}

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 z-40 transform transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-50"
        >
          <ChevronLeft
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        </button>

        <nav className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-2">
          {MENU_ITEMS.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-gray-50 to-transparent pointer-events-none transition-opacity duration-300 ${
            isCollapsed 
              ? 'opacity-0' 
              : 'opacity-100 delay-100'
          }`}
        >
          <div className="text-center text-xs text-gray-500">
            <p>© 2024 HRM System</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}