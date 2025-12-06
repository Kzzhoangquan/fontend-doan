'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';

export interface CameraCaptureProps {
  onCapture: (imageBlob: Blob, imageDataUrl: string) => void;
  onCancel: () => void;
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

export default function CameraCapture({
  onCapture,
  onCancel,
  facingMode = 'user',
  width = 640,
  height = 480,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLoadingRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

  // Start camera stream
  const startCamera = useCallback(async () => {
    // Don't start if already loading or if stream exists and is active
    if (isLoadingRef.current || (streamRef.current && streamRef.current.active)) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Mobile-friendly constraints - simplified for better compatibility
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const constraints: MediaStreamConstraints = {
        video: isMobile
          ? {
              // Mobile: simpler constraints, let browser choose best resolution
              facingMode: currentFacingMode,
            }
          : {
              // Desktop: can specify resolution
              facingMode: currentFacingMode,
              width: { ideal: width, max: 1920 },
              height: { ideal: height, max: 1080 },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        // Stop any existing playback first
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        videoRef.current.srcObject = stream;
        
        // Play with error handling
        try {
          await videoRef.current.play().catch((playError) => {
            // Ignore "play() was interrupted" errors - they're harmless
            if (playError.name !== 'AbortError' && playError.name !== 'NotAllowedError') {
              console.warn('Video play error (non-critical):', playError);
            }
          });
        } catch (playError: any) {
          // Video might already be playing, which is fine
          if (playError.name !== 'AbortError') {
            console.warn('Video play error:', playError);
          }
        }
      }

      isLoadingRef.current = false;
      setIsLoading(false);
    } catch (err: any) {
      console.error('Camera error:', err);
      
      let errorMessage = 'Không thể truy cập camera';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (isMobile) {
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            errorMessage = 'Quyền truy cập camera bị từ chối.\n\n📱 Trên iPhone/iPad:\n1. Click icon 🔒 hoặc 📷 trên thanh địa chỉ Safari\n2. Tìm "Camera" → Chọn "Allow"\n3. Hoặc: Settings → Safari → Camera → Allow\n4. Refresh trang và thử lại';
          } else {
            errorMessage = 'Quyền truy cập camera bị từ chối.\n\n📱 Trên Android:\n1. Click icon 🔒 hoặc ⓘ trên thanh địa chỉ\n2. Tìm "Camera" → Chọn "Allow"\n3. Hoặc: Settings → Site Settings → Camera → Allow\n4. Refresh trang và thử lại';
          }
        } else {
          errorMessage = 'Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.';
        }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Không tìm thấy camera. Vui lòng kiểm tra thiết bị của bạn.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng khác và thử lại.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Cấu hình camera không được hỗ trợ. Đang thử cấu hình đơn giản hơn...';
      } else if (err.name === 'SecurityError') {
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        if (!isSecure) {
          errorMessage = '⚠️ Camera yêu cầu HTTPS!\n\nVui lòng:\n1. Chạy website trên HTTPS\n2. Hoặc sử dụng localhost\n3. Hoặc dùng Safari/Firefox (có thể cho phép HTTP)';
        } else {
          errorMessage = 'Lỗi bảo mật khi truy cập camera.';
        }
      }

      setError(errorMessage);
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [currentFacingMode, width, height]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isLoadingRef.current = false;
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image if using front camera
    if (currentFacingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add timestamp overlay
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, canvas.height - 40, canvas.width, 40);
    context.fillStyle = 'white';
    context.font = '14px Arial';
    context.textAlign = 'center';
    const timestamp = new Date().toLocaleString('vi-VN');
    context.fillText(`Chấm công: ${timestamp}`, canvas.width / 2, canvas.height - 15);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
        }
      },
      'image/jpeg',
      0.9
    );
  }, [currentFacingMode]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedBlob(null);
  }, []);

  // Confirm and submit photo
  const confirmPhoto = useCallback(() => {
    if (capturedBlob && capturedImage) {
      onCapture(capturedBlob, capturedImage);
    }
  }, [capturedBlob, capturedImage, onCapture]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setCurrentFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  // Start camera on mount with delay to avoid permission issues
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted && !streamRef.current) {
        startCamera();
      }
    }, 300); // Delay để tránh lỗi permission khi component mount quá nhanh
    
    return () => {
      mounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, []); // Only run once on mount

  // Restart camera when facing mode changes (but not if there's an error or captured image)
  useEffect(() => {
    if (!capturedImage && !error && streamRef.current === null) {
      let mounted = true;
      const timer = setTimeout(() => {
        if (mounted) {
          startCamera();
        }
      }, 200); // Small delay to avoid conflicts
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [currentFacingMode]); // Only restart when facing mode changes

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button
          onClick={handleCancel}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium">Chụp ảnh xác thực</h2>
        <button
          onClick={switchCamera}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          disabled={isLoading || !!error}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p>Đang khởi động camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-4">
            <div className="text-center text-white max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Lỗi Camera</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`max-w-full max-h-full ${
            currentFacingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${capturedImage || isLoading || error ? 'hidden' : ''}`}
        />

        {/* Captured Image Preview */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Canvas for capturing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Face guide overlay */}
        {!capturedImage && !isLoading && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-80 border-2 border-white/50 rounded-full relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                Đặt khuôn mặt vào khung
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80">
        {!capturedImage ? (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-10 h-10 text-gray-900" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-2 text-white"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <RotateCcw className="w-8 h-8" />
              </div>
              <span className="text-sm">Chụp lại</span>
            </button>
            <button
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-2 text-white"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                <Check className="w-8 h-8" />
              </div>
              <span className="text-sm">Xác nhận</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

