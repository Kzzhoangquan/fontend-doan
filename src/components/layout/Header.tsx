'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MENU_ITEMS, MenuItem } from '@/lib/constants/menu';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Command,
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, hasAnyRole } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ✅ SỬ DỤNG useMemo ĐỂ CACHE allMenuItems
  const allMenuItems = useMemo(() => {
    const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
      let result: MenuItem[] = [];
      
      items.forEach(item => {
        // CHECK ROLE
        if (hasAnyRole(item.roles)) {
          result.push(item);
          
          // Nếu có children, flatten children
          if (item.children) {
            const filteredChildren = item.children.filter(child => hasAnyRole(child.roles));
            result = [...result, ...filteredChildren];
          }
        }
      });
      
      return result;
    };

    return flattenMenuItems(MENU_ITEMS);
  }, [user?.roles]); // ← Dùng user.roles thay vì hasAnyRole function

  // Search logic
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allMenuItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.href.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8));
      setShowSearchResults(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allMenuItems]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          navigateToItem(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSearchQuery('');
        break;
    }
  };

  const navigateToItem = (item: MenuItem) => {
    router.push(item.href);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    logout();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">HRM</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">HRM System</h1>
              <p className="text-xs text-gray-500">Hệ thống Quản lý Nhân sự & Dự án</p>
            </div>
          </div>
        </div>

        {/* Center Section - Smart Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Command className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              placeholder="Tìm kiếm nhanh (nhấn / để focus)..."
              className="w-full pl-10 pr-10 py-2 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs text-gray-500 px-2">
                    Tìm thấy {searchResults.length} kết quả
                  </p>
                </div>
                
                {searchResults.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`${item.href}-${index}`}
                      onClick={() => navigateToItem(item)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        index === selectedIndex ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          index === selectedIndex ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {highlightMatch(item.label, searchQuery)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.href}</p>
                      </div>
                      
                      <ArrowRight className={`w-4 h-4 shrink-0 ${
                        index === selectedIndex ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </button>
                  );
                })}

                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 px-2">
                    💡 Sử dụng ↑↓ để di chuyển, Enter để chọn, Esc để đóng
                  </p>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  Không tìm thấy kết quả cho "{searchQuery}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAvatarModal(true);
                }}
                className="relative cursor-pointer"
              >
                <img
                  key={user?.avatar_url || user?.id}
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username}`}
                  alt={user?.full_name}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username}`;
                  }}
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.roles?.[0]?.name || 'Nhân viên'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => router.push('/dashboard/settings/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Thông tin cá nhân
                  </button>
                  
                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </button>
                  
                  <div className="border-t border-gray-100 my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <div
              className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ảnh đại diện - {user?.full_name || user?.username}
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 flex items-center justify-center bg-gray-50">
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username}`}
                  alt={user?.full_name}
                  className="max-w-full max-h-[70vh] rounded-lg shadow-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username}`;
                  }}
                />
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={() => router.push('/dashboard/settings/profile')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Cập nhật ảnh đại diện
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}