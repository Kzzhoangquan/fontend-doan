'use client';

import { useState, useEffect, useRef } from 'react';
import { notification } from 'antd';
import { User, Save, Loader2, Mail, Phone, Calendar, MapPin, UserCircle, Lock, Upload, Camera, X, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { updateUser as updateUserAction } from '@/store/slices/authSlice';
import { employeeService, Employee } from '@/lib/api/services/employee.service';
import { getCurrentUser } from '@/lib/api/auth';
import { storage } from '@/lib/api/storage';
import { UserRole } from '@/lib/constants/roles';
import api from '@/lib/api/axios';

export default function ProfilePage() {
  const { user: authUser, hasRole } = useAuth();
  const dispatch = useAppDispatch();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    national_id: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if user is admin
  const isAdmin = hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.MANAGER);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Lấy thông tin từ auth profile hoặc từ storage
      let profileData: any = null;
      
      if (authUser?.id) {
        try {
          profileData = await employeeService.getById(authUser.id);
        } catch (err) {
          // Fallback to stored user data
          profileData = storage.getUser() || authUser;
        }
      } else {
        profileData = storage.getUser() || getCurrentUser();
      }

      if (profileData) {
        setUser(profileData);
        setTwoFactorEnabled(profileData.two_factor_enabled || false);
        setFormData({
          full_name: profileData.full_name || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          dob: profileData.dob ? (typeof profileData.dob === 'string' ? profileData.dob.split('T')[0] : new Date(profileData.dob).toISOString().split('T')[0]) : '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          national_id: profileData.national_id || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: 'Không thể tải thông tin cá nhân',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Không tìm thấy thông tin người dùng',
      });
      return;
    }

    try {
      setSaving(true);
      // Chỉ cho phép admin sửa email và phone
      const updateData: any = { ...formData };
      if (!isAdmin) {
        // Nếu không phải admin, không gửi email và phone
        delete updateData.email;
        delete updateData.phone;
      }
      
      const updated = await employeeService.update(user.id, updateData);
      
      // Cập nhật user trong storage và Redux store
      const currentUser = storage.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updated };
        storage.setUser(updatedUser);
        // Cập nhật Redux store để Header tự động re-render
        dispatch(updateUserAction({ user: updated }));
      }

      setUser(updated);
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã cập nhật thông tin cá nhân',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể cập nhật thông tin',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!user?.id) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Không tìm thấy thông tin người dùng',
      });
      return;
    }

    try {
      setSendingOtp(true);
      // Gọi API để gửi OTP
      await api.post('/auth/password-change/request-otp');
      setOtpSent(true);
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.',
      });
    } catch (err: any) {
      console.error('Error requesting OTP:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể gửi mã OTP',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Không tìm thấy thông tin người dùng',
      });
      return;
    }

    if (!passwordData.otp || !passwordData.newPassword) {
      notificationApi.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notificationApi.warning({
        message: 'Cảnh báo',
        description: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      notificationApi.warning({
        message: 'Cảnh báo',
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
      return;
    }

    try {
      setSaving(true);
      // Gọi API để verify OTP và đổi mật khẩu
      await api.post('/auth/password-change/verify', {
        otp: passwordData.otp,
        new_password: passwordData.newPassword,
      });

      setPasswordData({
        newPassword: '',
        confirmPassword: '',
        otp: '',
      });
      setShowPasswordForm(false);
      setOtpSent(false);
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã đổi mật khẩu thành công',
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể đổi mật khẩu',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user?.id) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Không tìm thấy thông tin người dùng',
      });
      return;
    }

    try {
      setUpdating2FA(true);
      const newValue = !twoFactorEnabled;
      
      await api.patch(`/employees/${user.id}/two-factor`, {
        two_factor_enabled: newValue,
      });

      setTwoFactorEnabled(newValue);
      setUser({ ...user, two_factor_enabled: newValue });
      
      // Update Redux store
      dispatch(updateUserAction({ user: { two_factor_enabled: newValue } }));

      notificationApi.success({
        message: 'Thành công',
        description: newValue 
          ? 'Đã bật xác thực 2 yếu tố. Bạn sẽ cần nhập mã OTP khi đăng nhập.'
          : 'Đã tắt xác thực 2 yếu tố.',
      });
    } catch (err: any) {
      console.error('Error updating 2FA:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể cập nhật cài đặt xác thực 2 yếu tố',
      });
    } finally {
      setUpdating2FA(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notificationApi.error({
        message: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
      });
      return;
    }

    try {
      setUploadingAvatar(true);
      
      // 1. Request presign URL
      const presignResponse = await api.post('/employees/avatar/presign-url', {
        content_type: file.type,
      });
      const { uploadUrl, fileUrl } = presignResponse.data;

      // 2. Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // 3. Update employee with new avatar URL
      const updated = await employeeService.update(user.id, {
        avatar_url: fileUrl,
      });

      // Update user in storage and Redux store
      const currentUser = storage.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updated };
        storage.setUser(updatedUser);
        // Cập nhật Redux store để Header tự động re-render với avatar mới
        dispatch(updateUserAction({ user: { avatar_url: fileUrl } }));
      }

      setUser(updated);
      notificationApi.success({
        message: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
      });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      notificationApi.error({
        message: 'Lỗi',
        description: err.response?.data?.message || err.message || 'Không thể upload ảnh đại diện',
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {contextHolder}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8" />
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div
                  onClick={() => user?.avatar_url && setShowAvatarModal(true)}
                  className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full overflow-hidden ${
                    user?.avatar_url ? 'cursor-pointer hover:ring-4 hover:ring-blue-300 transition-all' : ''
                  }`}
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg z-10"
                  title="Đổi ảnh đại diện"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.full_name || 'Chưa có tên'}</h2>
              <p className="text-sm text-gray-500 mt-1">{user?.employee_code || ''}</p>
              {user?.employee_positions && user.employee_positions.length > 0 && (
                <>
                  {user.employee_positions
                    .filter(ep => ep.is_current)
                    .slice(0, 1)
                    .map((ep, idx) => (
                      <div key={ep.id || idx}>
                        <p className="text-sm text-gray-500 mt-1">{ep.position?.title || ''}</p>
                        <p className="text-sm text-gray-500 mt-1">{ep.department?.name || ''}</p>
                      </div>
                    ))}
                </>
              )}
              
              {user?.roles && user.roles.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Vai trò:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                  {!isAdmin && (
                    <span className="text-xs text-gray-500 ml-2">(Chỉ admin mới được sửa)</span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isAdmin}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                  {!isAdmin && (
                    <span className="text-xs text-gray-500 ml-2">(Chỉ admin mới được sửa)</span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isAdmin}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CMND/CCCD
                </label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thông tin
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Cài đặt
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố (2FA)</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Khi bật, bạn sẽ cần nhập mã OTP được gửi đến email mỗi khi đăng nhập để tăng cường bảo mật.
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={updating2FA}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  } ${updating2FA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Cài đặt
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố (2FA)</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Khi bật, bạn sẽ cần nhập mã OTP được gửi đến email mỗi khi đăng nhập để tăng cường bảo mật.
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={updating2FA}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  } ${updating2FA ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Đổi mật khẩu
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showPasswordForm ? 'Ẩn' : 'Hiển thị'}
              </button>
            </div>

            {showPasswordForm && (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        Để đổi mật khẩu, hệ thống sẽ gửi mã OTP đến email của bạn để xác nhận.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleRequestOTP}
                        disabled={sendingOtp}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Gửi mã OTP
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        ✅ Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã OTP bên dưới.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="otp"
                        value={passwordData.otp}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập mã OTP (6 chữ số)"
                        maxLength={6}
                      />
                      <button
                        onClick={handleRequestOTP}
                        disabled={sendingOtp}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        {sendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setPasswordData({ newPassword: '', confirmPassword: '', otp: '' });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang đổi...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Đổi mật khẩu
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && user?.avatar_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-[768px] h-[768px] rounded-full object-cover shadow-2xl border-4 border-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.username}`;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

