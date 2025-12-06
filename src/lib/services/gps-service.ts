/**
 * GPS Service
 * 
 * Handles geolocation for attendance verification.
 * Uses the browser's Geolocation API to get the user's current position.
 */

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
}

export interface GPSError {
  code: number;
  message: string;
}

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radius_meters: number;
}

class GPSService {
  private watchId: number | null = null;
  private lastPosition: GPSPosition | null = null;

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Check if running on secure origin (HTTPS or localhost)
   * Chrome requires HTTPS for geolocation (except localhost)
   */
  private isSecureOrigin(): boolean {
    if (typeof window === 'undefined') return false;
    const { protocol, hostname } = window.location;
    return (
      protocol === 'https:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'
    );
  }

  /**
   * Get current position with high accuracy
   * Chrome-compatible: requires HTTPS, minimum 15s timeout, enableHighAccuracy
   * @param timeout - Maximum time to wait for position (ms) - minimum 15000 for Chrome
   * @param maxAge - Maximum age of cached position (ms)
   */
  async getCurrentPosition(
    timeout: number = 30000,
    maxAge: number = 0
  ): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser',
        } as GPSError);
        return;
      }

      // Chrome requires HTTPS (except localhost)
      if (!this.isSecureOrigin()) {
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if (isChrome) {
          reject({
            code: 1,
            message: 'Chrome yêu cầu HTTPS để lấy vị trí.\n\nVui lòng:\n1. Chạy website trên HTTPS\n2. Hoặc sử dụng localhost\n3. Hoặc dùng Safari/Firefox',
          } as GPSError);
          return;
        }
      }

      // Chrome requires minimum 15s timeout for high accuracy
      const minTimeout = 15000;
      const actualTimeout = Math.max(timeout, minTimeout);

      console.log('[GPS] Requesting position...', {
        timeout: actualTimeout,
        maxAge,
        secureOrigin: this.isSecureOrigin(),
        userAgent: navigator.userAgent.substring(0, 50),
      });

      // Try high accuracy first (Chrome requirement)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[GPS] Position received:', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          const gpsPosition: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.lastPosition = gpsPosition;
          resolve(gpsPosition);
        },
        (error) => {
          console.error('[GPS] Error getting position:', {
            code: error.code,
            message: error.message,
            isChrome: /Chrome/.test(navigator.userAgent),
            isSecure: this.isSecureOrigin(),
          });

          let message = 'Unknown error occurred';
          // error.code is a number: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              const isChrome = /Chrome/.test(navigator.userAgent);
              if (isMobile) {
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  message = 'Quyền truy cập vị trí bị từ chối.\n\n📱 Trên iPhone/iPad:\n1. Mở Settings → Safari\n2. Tìm "Location Services" → Bật\n3. Hoặc: Click icon 🔒 trên thanh địa chỉ Safari\n4. Chọn "Allow" cho Location\n5. Refresh trang và thử lại';
                } else {
                  message = 'Quyền truy cập vị trí bị từ chối.\n\n📱 Trên Android:\n1. Click icon 🔒 hoặc ⓘ trên thanh địa chỉ\n2. Tìm "Location" → Chọn "Allow"\n3. Hoặc: Settings → Site Settings → Location → Allow\n4. Refresh trang và thử lại';
                }
              } else if (isChrome) {
                message = 'Chrome đã từ chối quyền truy cập vị trí.\n\nVui lòng:\n1. Click icon 🔒 bên cạnh URL\n2. Tìm "Vị trí" → chọn "Cho phép"\n3. Hoặc: Chrome Settings → Privacy → Site Settings → Location\n4. Tìm website này → Reset permission\n5. Refresh trang và thử lại\n\nLưu ý: Chrome nhớ permission rất chặt, nếu đã từng Block thì cần reset.';
              } else {
                message = 'Quyền truy cập vị trí bị từ chối. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.';
              }
              break;
            case 2: // POSITION_UNAVAILABLE
              message = 'Không thể xác định vị trí.\n\nCó thể do:\n1. VPN đang bật (tắt VPN và thử lại)\n2. Mạng WiFi yếu\n3. GPS bị tắt\n4. Firewall chặn Google Location Services (nếu dùng Chrome)';
              break;
            case 3: // TIMEOUT
              message = `Hết thời gian chờ (${actualTimeout}ms).\n\nVui lòng:\n1. Kiểm tra kết nối mạng\n2. Tắt VPN nếu đang dùng\n3. Thử lại`;
              break;
            default:
              // Fallback to browser's error message if available
              if (error.message && error.message !== 'User denied Geolocation') {
                message = error.message;
              }
          }
          reject({ code: error.code, message } as GPSError);
        },
        {
          enableHighAccuracy: true, // Chrome requirement
          timeout: actualTimeout,
          maximumAge: maxAge,
        }
      );
    });
  }

  /**
   * Start watching position (for real-time updates)
   */
  watchPosition(
    onUpdate: (position: GPSPosition) => void,
    onError?: (error: GPSError) => void
  ): void {
    if (!this.isSupported()) {
      onError?.({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        this.lastPosition = gpsPosition;
        onUpdate(gpsPosition);
      },
      (error) => {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position unavailable';
            break;
          case error.TIMEOUT:
            message = 'Request timeout';
            break;
        }
        onError?.({ code: error.code, message });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 30000,
      }
    );
  }

  /**
   * Stop watching position
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get the last known position
   */
  getLastPosition(): GPSPosition | null {
    return this.lastPosition;
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if a position is within a geofence
   */
  isWithinGeofence(position: GPSPosition, geofence: GeofenceConfig): boolean {
    const distance = this.calculateDistance(
      position.latitude,
      position.longitude,
      geofence.latitude,
      geofence.longitude
    );
    return distance <= geofence.radius_meters;
  }

  /**
   * Get distance from office
   */
  getDistanceFromOffice(position: GPSPosition, geofence: GeofenceConfig): number {
    return Math.round(
      this.calculateDistance(
        position.latitude,
        position.longitude,
        geofence.latitude,
        geofence.longitude
      )
    );
  }

  /**
   * Request permission explicitly (some browsers)
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Check current permission status first
      const status = await this.checkPermission();
      console.log('[GPS] Current permission status:', status);
      
      if (status === 'denied') {
        console.warn('[GPS] Permission already denied. User needs to reset in browser settings.');
        return false;
      }
      
      // Try to get position - this will trigger permission dialog if needed
      // Use shorter timeout for permission request
      await this.getCurrentPosition(5000, 0); // No cache, 5s timeout
      return true;
    } catch (error: any) {
      console.error('[GPS] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Check if permission is granted
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        console.log('[GPS] Permission check result:', result.state);
        return result.state;
      } catch (err) {
        console.warn('[GPS] Permission API not available:', err);
        return 'prompt';
      }
    }
    console.log('[GPS] Permissions API not supported, assuming prompt');
    return 'prompt';
  }
}

// Export singleton instance
export const gpsService = new GPSService();

