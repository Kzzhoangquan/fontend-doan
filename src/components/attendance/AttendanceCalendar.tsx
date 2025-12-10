'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle2, Clock, Camera } from 'lucide-react';
import { Attendance } from '@/lib/api/services/attendance.service';
import { attendanceService } from '@/lib/api/services/attendance.service';

interface AttendanceCalendarProps {
  employeeId?: number;
  onDateClick?: (date: string, attendance: Attendance | null) => void;
}

interface DayData {
  date: Date;
  attendance: Attendance | null;
  status: 'valid' | 'late' | 'early' | 'missing' | 'none';
}

export default function AttendanceCalendar({ employeeId, onDateClick }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  // Get first and last day of current month
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date;
  }, [currentDate]);

  // Fetch attendances for current month
  useEffect(() => {
    const fetchAttendances = async () => {
      setLoading(true);
      try {
        const startDate = monthStart.toISOString().split('T')[0];
        const endDate = monthEnd.toISOString().split('T')[0];
        
        const params: any = {
          startDate,
          endDate,
          pageSize: 1000,
        };
        
        if (employeeId) {
          params.employeeId = employeeId;
        }

        const response = await attendanceService.getAll(params);
        setAttendances(response.data);
      } catch (error) {
        console.error('Error fetching attendances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, [currentDate, employeeId, monthStart, monthEnd]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: DayData[] = [];
    const startDate = new Date(monthStart);
    
    // Start from Monday of the week containing the first day
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      // Find attendance by date field (date always has data)
      const attendance = attendances.find(att => att.date === dateStr) || null;
      
      let status: DayData['status'] = 'none';
      if (attendance) {
        // Đỏ: Đi muộn hoặc về sớm
        if ((attendance.late_minutes && attendance.late_minutes > 0) || 
            (attendance.early_leave_minutes && attendance.early_leave_minutes > 0)) {
          status = 'late'; // Dùng 'late' cho cả đi muộn và về sớm (màu đỏ)
        } 
        // Xanh: Chấm công hợp lệ (có check_in, check_out và is_verified)
        else if (attendance.check_in && attendance.check_out && (attendance as any).is_verified) {
          status = 'valid';
        } 
        // Cảnh báo: Có record nhưng chưa hoàn thành (thiếu check_in hoặc check_out)
        else if (!attendance.check_in || !attendance.check_out) {
          status = 'missing';
        } 
        // Xanh: Có check_in và check_out nhưng chưa verified (vẫn coi là hợp lệ)
        else if (attendance.check_in && attendance.check_out) {
          status = 'valid';
        } else {
          status = 'missing';
        }
      } else if (date.getMonth() === currentDate.getMonth()) {
        // Cảnh báo: Không có record chấm công trong tháng hiện tại
        status = 'missing';
      }

      days.push({ date, attendance, status });
    }

    return days;
  }, [attendances, monthStart, currentDate]);

  const handleDateClick = (dayData: DayData) => {
    if (dayData.date.getMonth() !== currentDate.getMonth()) return;
    
    const dateStr = dayData.date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedAttendance(dayData.attendance);
    
    if (onDateClick) {
      onDateClick(dateStr, dayData.attendance);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const getDayClassName = (dayData: DayData) => {
    const isCurrentMonth = dayData.date.getMonth() === currentDate.getMonth();
    const isToday = dayData.date.toDateString() === new Date().toDateString();
    
    let baseClass = 'h-20 sm:h-24 p-2 border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50';
    
    if (!isCurrentMonth) {
      return `${baseClass} bg-gray-50 text-gray-400`;
    }

    if (isToday) {
      baseClass += ' border-blue-500 border-2';
    }

    switch (dayData.status) {
      case 'valid':
        return `${baseClass} bg-green-50 hover:bg-green-100 border-green-200`;
      case 'late':
      case 'early':
        return `${baseClass} bg-red-50 hover:bg-red-100 border-red-200`;
      case 'missing':
        return `${baseClass} bg-yellow-50 hover:bg-yellow-100 border-yellow-200`;
      default:
        return `${baseClass} bg-white`;
    }
  };

  const getDayIndicator = (dayData: DayData) => {
    if (dayData.status === 'valid') {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    } else if (dayData.status === 'late' || dayData.status === 'early') {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (dayData.status === 'missing') {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => {
            const dateStr = dayData.date.toISOString().split('T')[0];
            const isCurrentMonth = dayData.date.getMonth() === currentDate.getMonth();
            const isToday = dayData.date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={getDayClassName(dayData)}
                onClick={() => isCurrentMonth && handleDateClick(dayData)}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {dayData.date.getDate()}
                  </span>
                  {isCurrentMonth && getDayIndicator(dayData)}
                </div>
                
                {isCurrentMonth && dayData.attendance && (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {dayData.attendance.check_in && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(dayData.attendance.check_in).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {dayData.attendance.check_out && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(dayData.attendance.check_out).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span>Chấm công hợp lệ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span>Đi muộn / Về sớm</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
          <span>Chưa chấm công</span>
        </div>
      </div>

      {/* Detail Popup */}
      {selectedDate && (
        <AttendanceDetailPopup
          date={selectedDate}
          attendance={selectedAttendance}
          onClose={() => {
            setSelectedDate(null);
            setSelectedAttendance(null);
          }}
        />
      )}
    </div>
  );
}

// Detail Popup Component
interface AttendanceDetailPopupProps {
  date: string;
  attendance: Attendance | null;
  onClose: () => void;
}

function AttendanceDetailPopup({ date, attendance, onClose }: AttendanceDetailPopupProps) {
  const isClient = typeof window !== 'undefined';
  const dateObj = new Date(date);
  const formattedDate = isClient 
    ? dateObj.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : date;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chi tiết chấm công</h3>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {attendance ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {attendance.late_minutes && attendance.late_minutes > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Đi muộn {attendance.late_minutes} phút</span>
                  </div>
                ) : attendance.early_leave_minutes && attendance.early_leave_minutes > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Về sớm {attendance.early_leave_minutes} phút</span>
                  </div>
                ) : (attendance as any).is_verified ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Chấm công hợp lệ</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Chưa hoàn thành</span>
                  </div>
                )}
              </div>

              {/* Check-in */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Check-in</span>
                </div>
                {attendance.check_in ? (
                  <div>
                    <p className="text-gray-900">
                      {isClient 
                        ? new Date(attendance.check_in).toLocaleString('vi-VN')
                        : attendance.check_in
                      }
                    </p>
                    {(attendance as any).check_in_photo_url && (
                      <div className="mt-2">
                        <img 
                          src={(attendance as any).check_in_photo_url} 
                          alt="Check-in photo"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa check-in</p>
                )}
              </div>

              {/* Check-out */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Check-out</span>
                </div>
                {attendance.check_out ? (
                  <div>
                    <p className="text-gray-900">
                      {isClient 
                        ? new Date(attendance.check_out).toLocaleString('vi-VN')
                        : attendance.check_out
                      }
                    </p>
                    {(attendance as any).check_out_photo_url && (
                      <div className="mt-2">
                        <img 
                          src={(attendance as any).check_out_photo_url} 
                          alt="Check-out photo"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa check-out</p>
                )}
              </div>

              {/* Work Hours */}
              {attendance.work_hours && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Giờ làm</span>
                  </div>
                  <p className="text-gray-900">{Number(attendance.work_hours).toFixed(2)} giờ</p>
                </div>
              )}

              {/* Note */}
              {attendance.note && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700">Ghi chú</span>
                  </div>
                  <p className="text-gray-900 text-sm">{attendance.note}</p>
                </div>
              )}

              {/* Verification Info */}
              {(attendance as any).verification_notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Thông tin xác thực</span>
                  </div>
                  <p className="text-blue-900 text-sm whitespace-pre-line">{(attendance as any).verification_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Chưa chấm công</p>
              <p className="text-gray-500">Ngày này chưa có bản ghi chấm công</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

