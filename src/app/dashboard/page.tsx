'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  FolderKanban, 
  DollarSign, 
  TrendingUp,
  Calendar,
  AlertCircle 
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Tổng nhân viên',
      value: '248',
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Dự án đang chạy',
      value: '32',
      change: '+5%',
      icon: FolderKanban,
      color: 'purple',
    },
    {
      label: 'Tổng lương tháng',
      value: '₫2.4B',
      change: '+8%',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Hiệu suất',
      value: '94%',
      change: '+2%',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-(--color-primary-blue) to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Xin chào, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Chào mừng bạn quay trở lại với hệ thống quản lý
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
            <button className="text-sm text-(--color-primary-blue) hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Nguyễn Văn A đã hoàn thành task "Thiết kế giao diện"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-(--color-primary-blue) hover:bg-blue-50 transition-all text-left">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Thêm nhân viên</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-(--color-primary-blue) hover:bg-blue-50 transition-all text-left">
              <FolderKanban className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Tạo dự án mới</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-(--color-primary-blue) hover:bg-blue-50 transition-all text-left">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Điểm danh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}