'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Smartphone,
  Check,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
} from 'lucide-react';
import CameraCapture from './CameraCapture';
import { deviceFingerprint, DeviceInfo } from '@/lib/services/device-fingerprint';
// GPS không còn cần thiết - đã bỏ GPS verification
import {
  attendanceVerificationService,
  AttendanceActionType,
  AttendanceResult,
  SubmitAttendanceDto,
} from '@/lib/api/services/attendance-verification.service';

interface AttendanceVerificationModalProps {
  isOpen: boolean;
  actionType: AttendanceActionType;
  onClose: () => void;
  onSuccess: (result: AttendanceResult) => void;
}

type VerificationStep = 'init' | 'device' | 'camera' | 'uploading' | 'submitting' | 'result';

interface StepStatus {
  device: 'pending' | 'loading' | 'success' | 'error';
  camera: 'pending' | 'loading' | 'success' | 'error';
}

export default function AttendanceVerificationModal({
  isOpen,
  actionType,
  onClose,
  onSuccess,
}: AttendanceVerificationModalProps) {
  // State
  const [currentStep, setCurrentStep] = useState<VerificationStep>('init');
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    device: 'pending',
    camera: 'pending',
  });
  const [error, setError] = useState<string | null>(null);

  // Verification data
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [result, setResult] = useState<AttendanceResult | null>(null);

  // Camera state
  const [showCamera, setShowCamera] = useState(false);

  // Auto-start: Lấy device fingerprint và mở camera khi modal mở
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('device');
      setStepStatus({ device: 'loading', camera: 'pending' });
      setError(null);
      setDeviceInfo(null);
      setCapturedPhoto(null);
      setResult(null);
      setShowCamera(false);

      // Tự động lấy device fingerprint
      const autoStart = async () => {
        try {
          const device = await deviceFingerprint.getDeviceInfo();
          setDeviceInfo(device);
          setStepStatus(prev => ({ ...prev, device: 'success' }));
          
          // Tự động mở camera sau khi có device info
          setCurrentStep('camera');
          setShowCamera(true);
        } catch (err: any) {
          console.error('Device fingerprint error:', err);
          setStepStatus(prev => ({ ...prev, device: 'error' }));
          setError(err.message || 'Không thể lấy thông tin thiết bị');
        }
      };

      autoStart();
    }
  }, [isOpen]);

  // Các hàm này không còn cần thiết vì đã tự động hóa
  // Giữ lại để dùng cho retry nếu cần

  // Handle photo capture - tự động upload và submit
  const handlePhotoCapture = useCallback(async (blob: Blob, dataUrl: string) => {
    setShowCamera(false);
    setCapturedPhoto({ blob, dataUrl });
    setStepStatus(prev => ({ ...prev, camera: 'success' }));

    if (!deviceInfo) {
      setError('Thiếu dữ liệu xác thực. Vui lòng thử lại.');
      return;
    }

    try {
      // Step 1: Request pre-signed URL và upload photo to S3
      setCurrentStep('uploading');
      
      let photoUrl: string | undefined = undefined;

      try {
        // Request pre-signed URL từ backend
        const challengeResponse = await attendanceVerificationService.requestChallenge({
          action_type: actionType,
          device_id: deviceInfo.device_id,
          device_name: deviceInfo.device_name,
          device_type: deviceInfo.device_type,
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          screen_resolution: deviceInfo.screen_resolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          user_agent: deviceInfo.user_agent,
        });

        // Upload photo lên S3 bằng pre-signed URL
        if (challengeResponse.upload_url && blob) {
          const uploadSuccess = await attendanceVerificationService.uploadPhotoToS3(
            challengeResponse.upload_url,
            blob
          );

          if (uploadSuccess) {
            photoUrl = challengeResponse.photo_url;
            console.log('[Photo Upload] Success! URL:', photoUrl);
          } else {
            console.warn('[Photo Upload] Failed, but continuing without photo');
          }
        }
      } catch (uploadError: any) {
        console.error('[Photo Upload] Error:', uploadError);
        // Tiếp tục submit mà không có photo nếu upload fail
      }

      // Step 2: Submit attendance với photo URL
      setCurrentStep('submitting');

      // Chỉ gửi photo_url nếu có giá trị (không gửi undefined)
      const submitData: SubmitAttendanceDto = {
        action_type: actionType,
        device_id: deviceInfo.device_id,
        // GPS không bắt buộc - không gửi
      };

      // Luôn thêm photo_url nếu có (đã upload thành công)
      if (photoUrl) {
        submitData.photo_url = photoUrl;
        console.log('[Submit] Photo URL:', photoUrl);
      } else {
        console.warn('[Submit] No photo URL - continuing without photo');
      }
      
      console.log('[Submit] Sending data:', submitData);
      const attendanceResult = await attendanceVerificationService.submitAttendance(submitData);

      setResult(attendanceResult);
      setCurrentStep('result');

    } catch (err: any) {
      console.error('Submit error:', err);
      
      // Log chi tiết lỗi validation
      if (err.response?.status === 400) {
        const errorDetails = err.response?.data;
        console.error('Validation error details:', errorDetails);
        
        if (errorDetails?.message) {
          // NestJS validation errors
          if (Array.isArray(errorDetails.message)) {
            setError(errorDetails.message.join(', '));
          } else {
            setError(errorDetails.message);
          }
        } else {
          setError('Dữ liệu không hợp lệ. Vui lòng thử lại.');
        }
      } else {
        setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi gửi dữ liệu');
      }
      
      // Reset step để user có thể thử lại
      setCurrentStep('camera');
    }
  }, [deviceInfo, actionType]);

  // Handle camera cancel
  const handleCameraCancel = useCallback(() => {
    setShowCamera(false);
    onClose();
  }, [onClose]);

  // Handle result confirmation
  const handleResultConfirm = useCallback(() => {
    if (result) {
      onSuccess(result);
    }
    onClose();
  }, [result, onSuccess, onClose]);

  // Retry verification - Reset và tự động chạy lại
  const handleRetry = useCallback(() => {
    setCurrentStep('device');
    setStepStatus({ device: 'loading', camera: 'pending' });
    setError(null);
    setDeviceInfo(null);
    setCapturedPhoto(null);
    setResult(null);
    setShowCamera(false);

    // Tự động chạy lại flow
    const retry = async () => {
      try {
        const device = await deviceFingerprint.getDeviceInfo();
        setDeviceInfo(device);
        setStepStatus(prev => ({ ...prev, device: 'success' }));
        setCurrentStep('camera');
        setShowCamera(true);
      } catch (err: any) {
        console.error('Device fingerprint error:', err);
        setStepStatus(prev => ({ ...prev, device: 'error' }));
        setError(err.message || 'Không thể lấy thông tin thiết bị');
      }
    };

    retry();
  }, []);

  if (!isOpen) return null;

  // Show camera full screen
  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handlePhotoCapture}
        onCancel={handleCameraCancel}
        facingMode="user"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${actionType === AttendanceActionType.CHECK_IN ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {actionType === AttendanceActionType.CHECK_IN ? 'Check-in' : 'Check-out'}
                </h2>
                <p className="text-white/80 text-sm">Xác thực chấm công</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Auto-loading: Device fingerprint đang được lấy tự động */}
          {currentStep === 'device' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang xác thực thiết bị...</p>
            </div>
          )}


          {/* Loading States */}
          {(currentStep === 'uploading' || currentStep === 'submitting') && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">
                {currentStep === 'uploading' ? 'Đang tải ảnh lên...' : 'Đang ghi nhận chấm công...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && currentStep !== 'result' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-800 font-medium mb-1 text-sm sm:text-base">Lỗi xác thực</p>
                  <div className="text-red-600 text-xs sm:text-sm whitespace-pre-line break-words">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result State */}
          {currentStep === 'result' && result && (
            <div className="text-center py-4">
              {result.is_verified ? (
                <div className="mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {actionType === AttendanceActionType.CHECK_IN ? 'Check-in' : 'Check-out'} thành công!
                  </h3>
                  <p className="text-gray-600">
                    {new Date(result.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Đã ghi nhận với cảnh báo
                  </h3>
                  <p className="text-yellow-600 text-sm">
                    {result.verification_notes}
                  </p>
                </div>
              )}

              {/* Result Details */}
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span>{result.device_verified ? 'Thiết bị đã xác thực' : 'Thiết bị mới'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span>{result.photo_captured ? 'Đã chụp ảnh' : 'Không có ảnh'}</span>
                  </div>
                  {result.late_minutes && result.late_minutes > 0 && (
                    <div className="col-span-2 text-red-600">
                      ⚠️ Đi muộn {result.late_minutes} phút
                    </div>
                  )}
                  {result.early_leave_minutes && result.early_leave_minutes > 0 && (
                    <div className="col-span-2 text-orange-600">
                      ⚠️ Về sớm {result.early_leave_minutes} phút
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {error && currentStep !== 'result' && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 sm:py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base font-medium touch-manipulation"
              >
                Đóng
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-3 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base font-medium touch-manipulation"
              >
                Thử lại
              </button>
            </div>
          )}

          {currentStep === 'result' && (
            <button
              onClick={handleResultConfirm}
              className="w-full px-4 py-3 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              Xác nhận
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Verification Step Item Component
function VerificationStepItem({
  icon,
  title,
  description,
  status,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  onClick?: () => void;
  disabled?: boolean;
}) {
  const canClick = onClick && !disabled && (status === 'pending' || status === 'error');
  
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border ${
        status === 'success' ? 'bg-green-50 border-green-200' :
        status === 'error' ? 'bg-red-50 border-red-200' :
        status === 'loading' ? 'bg-blue-50 border-blue-200' :
        'bg-gray-50 border-gray-200'
      } ${canClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={canClick ? onClick : undefined}
    >
      <div className={`p-2 rounded-lg ${
        status === 'success' ? 'bg-green-100 text-green-600' :
        status === 'error' ? 'bg-red-100 text-red-600' :
        status === 'loading' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-500'
      }`}>
        {status === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'success' ? (
          <Check className="w-5 h-5" />
        ) : status === 'error' ? (
          <X className="w-5 h-5" />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${
          status === 'success' ? 'text-green-800' :
          status === 'error' ? 'text-red-800' :
          status === 'loading' ? 'text-blue-800' :
          'text-gray-700'
        }`}>
          {title}
        </p>
        <p className={`text-sm truncate ${
          status === 'success' ? 'text-green-600' :
          status === 'error' ? 'text-red-600' :
          status === 'loading' ? 'text-blue-600' :
          'text-gray-500'
        }`}>
          {description}
        </p>
      </div>
      {canClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors touch-manipulation ${
            status === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {status === 'error' ? 'Thử lại' : 'Bắt đầu'}
        </button>
      )}
    </div>
  );
}

