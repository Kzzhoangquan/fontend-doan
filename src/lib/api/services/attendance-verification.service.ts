/**
 * Attendance Verification API Service
 * 
 * Handles secure attendance verification with GPS, photo, and device fingerprint.
 */

import axios from 'axios';
import { apiClient } from '../client';

export enum AttendanceActionType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export interface RequestChallengeDto {
  device_id: string;
  action_type: AttendanceActionType;
  device_name?: string;
  os?: string;
  browser?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  user_agent?: string;
}

export interface ChallengeResponse {
  token: string;
  expires_at: string;
  upload_url: string;
  photo_url: string;
  upload_expires_in: number;
  office_location: {
    latitude: number;
    longitude: number;
    radius_meters: number;
  };
  device_status: 'registered' | 'pending' | 'new';
  device_message?: string;
}

export interface SubmitAttendanceDto {
  action_type: AttendanceActionType;
  device_id: string;
  latitude?: number; // Optional - không bắt buộc
  longitude?: number; // Optional - không bắt buộc
  gps_accuracy?: number;
  photo_url?: string | null; // Optional
  note?: string;
}

export interface AttendanceResult {
  id: number;
  action_type: AttendanceActionType;
  timestamp: string;
  is_within_geofence: boolean;
  distance_from_office: number;
  device_verified: boolean;
  photo_captured: boolean;
  is_verified: boolean;
  verification_notes?: string;
  late_minutes?: number;
  early_leave_minutes?: number;
}

export interface TodayStatus {
  date: string;
  has_checked_in: boolean;
  has_checked_out: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
  work_hours: number | null;
  late_minutes: number | null;
  early_leave_minutes: number | null;
  is_verified: boolean | null;
}

export interface RegisterDeviceDto {
  device_id: string;
  device_name?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  user_agent?: string;
  is_primary?: boolean;
}

export interface EmployeeDevice {
  id: number;
  device_id: string;
  device_name: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  is_primary: boolean;
  last_used_at: string | null;
  created_at: string;
}

class AttendanceVerificationService {
  /**
   * Request a challenge token for attendance verification
   */
  async requestChallenge(data: RequestChallengeDto): Promise<ChallengeResponse> {
    const response = await apiClient.post<ChallengeResponse>(
      '/attendance/verify/request-challenge',
      data
    );
    return response.data;
  }

  /**
   * Submit attendance with verification data
   */
  async submitAttendance(data: SubmitAttendanceDto): Promise<AttendanceResult> {
    const response = await apiClient.post<AttendanceResult>(
      '/attendance/verify/submit',
      data
    );
    return response.data;
  }

  /**
   * Get today's attendance status
   */
  async getTodayStatus(): Promise<TodayStatus | null> {
    try {
      const response = await apiClient.get<TodayStatus>(
        '/attendance/verify/today-status'
      );
      return response.data;
    } catch (error: any) {
      // Don't log error for 401/404 - endpoint might not exist yet
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Error fetching today status:', error);
      }
      return null;
    }
  }

  /**
   * Register a new device
   */
  async registerDevice(data: RegisterDeviceDto): Promise<EmployeeDevice> {
    const response = await apiClient.post<EmployeeDevice>(
      '/attendance/devices/register',
      data
    );
    return response.data;
  }

  /**
   * Get user's registered devices
   */
  async getMyDevices(): Promise<EmployeeDevice[]> {
    const response = await apiClient.get<EmployeeDevice[]>(
      '/attendance/devices'
    );
    return response.data;
  }

  /**
   * Upload photo to S3 using pre-signed URL
   */
  async uploadPhotoToS3(uploadUrl: string, imageBlob: Blob): Promise<boolean> {
    try {
      console.log('[S3 Upload] Starting upload...', {
        url: uploadUrl.substring(0, 100) + '...',
        blobSize: imageBlob.size,
        blobType: imageBlob.type,
      });

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageBlob,
        headers: {
          'Content-Type': imageBlob.type || 'image/jpeg',
        },
      });

      console.log('[S3 Upload] Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error');
        console.error('[S3 Upload] Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        
        // Check for CORS error
        if (response.status === 0 || response.statusText === '') {
          console.error('[S3 Upload] CORS Error: S3 bucket chưa được cấu hình CORS');
        }
        
        return false;
      }

      console.log('[S3 Upload] Upload successful!');
      return true;
    } catch (error: any) {
      console.error('[S3 Upload] Network error:', {
        message: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}

export const attendanceVerificationService = new AttendanceVerificationService();

