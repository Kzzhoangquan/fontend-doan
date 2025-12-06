/**
 * Device Fingerprint Service
 * 
 * Generates a unique device identifier based on browser/device characteristics.
 * This is used to verify that attendance is submitted from registered devices.
 */

import { sha256 } from './crypto-utils';

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  user_agent: string;
}

interface FingerprintComponents {
  userAgent: string;
  language: string;
  colorDepth: number;
  deviceMemory: number | undefined;
  hardwareConcurrency: number;
  screenResolution: string;
  availableScreenResolution: string;
  timezoneOffset: number;
  timezone: string;
  sessionStorage: boolean;
  localStorage: boolean;
  indexedDb: boolean;
  platform: string;
  plugins: string;
  canvas: string;
  webgl: string;
  webglVendor: string;
  webglRenderer: string;
  fonts: string[];
  audio: string;
  touchSupport: {
    maxTouchPoints: number;
    touchEvent: boolean;
    touchStart: boolean;
  };
}

class DeviceFingerprintService {
  private cachedFingerprint: string | null = null;
  private cachedDeviceInfo: DeviceInfo | null = null;

  /**
   * Get the device fingerprint hash
   */
  async getFingerprint(): Promise<string> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    const components = await this.collectComponents();
    const fingerprintString = JSON.stringify(components);
    this.cachedFingerprint = await sha256(fingerprintString);
    
    return this.cachedFingerprint;
  }

  /**
   * Get full device information including fingerprint
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.cachedDeviceInfo) {
      return this.cachedDeviceInfo;
    }

    const fingerprint = await this.getFingerprint();
    const userAgent = navigator.userAgent;
    
    this.cachedDeviceInfo = {
      device_id: fingerprint,
      device_name: this.getDeviceName(),
      device_type: this.getDeviceType(),
      os: this.getOS(),
      browser: this.getBrowser(),
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      user_agent: userAgent,
    };

    return this.cachedDeviceInfo;
  }

  /**
   * Collect all fingerprint components
   */
  private async collectComponents(): Promise<FingerprintComponents> {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      screenResolution: `${screen.width}x${screen.height}`,
      availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
      timezoneOffset: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionStorage: this.hasSessionStorage(),
      localStorage: this.hasLocalStorage(),
      indexedDb: this.hasIndexedDB(),
      platform: navigator.platform,
      plugins: this.getPlugins(),
      canvas: await this.getCanvasFingerprint(),
      webgl: this.getWebGLFingerprint(),
      webglVendor: this.getWebGLVendor(),
      webglRenderer: this.getWebGLRenderer(),
      fonts: this.getAvailableFonts(),
      // Audio fingerprint is optional (may show deprecation warning)
      audio: await this.getAudioFingerprint().catch(() => ''),
      touchSupport: this.getTouchSupport(),
    };
  }

  private hasSessionStorage(): boolean {
    try {
      return !!window.sessionStorage;
    } catch {
      return false;
    }
  }

  private hasLocalStorage(): boolean {
    try {
      return !!window.localStorage;
    } catch {
      return false;
    }
  }

  private hasIndexedDB(): boolean {
    try {
      return !!window.indexedDB;
    } catch {
      return false;
    }
  }

  private getPlugins(): string {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins.join(',');
  }

  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Draw text with specific font
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('ERP Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('ERP Fingerprint', 4, 17);

      // Get data URL and hash it
      const dataUrl = canvas.toDataURL();
      return await sha256(dataUrl);
    } catch {
      return '';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    } catch {
      return '';
    }
  }

  private getWebGLVendor(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    } catch {
      return '';
    }
  }

  private getWebGLRenderer(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      return (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER) || '';
    } catch {
      return '';
    }
  }

  private getAvailableFonts(): string[] {
    // Common fonts to check
    const fontList = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
      'Comic Sans MS', 'Consolas', 'Courier', 'Courier New', 'Georgia',
      'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma',
      'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana',
    ];

    const availableFonts: string[] = [];
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.left = '-9999px';
    span.style.fontSize = testSize;
    span.innerHTML = testString;
    document.body.appendChild(span);

    const baseFontWidths: Record<string, number> = {};
    for (const baseFont of baseFonts) {
      span.style.fontFamily = baseFont;
      baseFontWidths[baseFont] = span.offsetWidth;
    }

    for (const font of fontList) {
      for (const baseFont of baseFonts) {
        span.style.fontFamily = `'${font}', ${baseFont}`;
        if (span.offsetWidth !== baseFontWidths[baseFont]) {
          availableFonts.push(font);
          break;
        }
      }
    }

    document.body.removeChild(span);
    return availableFonts;
  }

  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute the sound
      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      const fingerprint = await new Promise<string>((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const output = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < output.length; i++) {
            sum += Math.abs(output[i]);
          }
          oscillator.disconnect();
          scriptProcessor.disconnect();
          audioContext.close();
          resolve(sum.toString());
        };
      });

      return fingerprint;
    } catch {
      return '';
    }
  }

  private getTouchSupport(): { maxTouchPoints: number; touchEvent: boolean; touchStart: boolean } {
    return {
      maxTouchPoints: navigator.maxTouchPoints || 0,
      touchEvent: 'TouchEvent' in window,
      touchStart: 'ontouchstart' in window,
    };
  }

  private getDeviceName(): string {
    const ua = navigator.userAgent;
    
    // Try to extract device model from user agent
    const iPhoneMatch = ua.match(/iPhone\s*(\d+)?/i);
    if (iPhoneMatch) return `iPhone ${iPhoneMatch[1] || ''}`.trim();

    const iPadMatch = ua.match(/iPad/i);
    if (iPadMatch) return 'iPad';

    const samsungMatch = ua.match(/SM-[A-Z0-9]+/i);
    if (samsungMatch) return `Samsung ${samsungMatch[0]}`;

    const pixelMatch = ua.match(/Pixel\s*\d*/i);
    if (pixelMatch) return pixelMatch[0];

    // Generic device names
    if (/Android/i.test(ua)) return 'Android Device';
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Macintosh/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux PC';

    return 'Unknown Device';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/ipad|tablet|playbook|silk/.test(ua)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    if (/Win/.test(platform)) {
      if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
      if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
      if (/Windows NT 6.2/.test(ua)) return 'Windows 8';
      if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
      return 'Windows';
    }

    if (/Mac/.test(platform)) {
      const versionMatch = ua.match(/Mac OS X (\d+[._]\d+)/);
      if (versionMatch) {
        return `macOS ${versionMatch[1].replace('_', '.')}`;
      }
      return 'macOS';
    }

    if (/iPhone|iPad|iPod/.test(platform)) {
      const versionMatch = ua.match(/OS (\d+[._]\d+)/);
      if (versionMatch) {
        return `iOS ${versionMatch[1].replace('_', '.')}`;
      }
      return 'iOS';
    }

    if (/Android/.test(ua)) {
      const versionMatch = ua.match(/Android (\d+(\.\d+)?)/);
      if (versionMatch) {
        return `Android ${versionMatch[1]}`;
      }
      return 'Android';
    }

    if (/Linux/.test(platform)) return 'Linux';

    return 'Unknown OS';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;

    // Order matters - check more specific browsers first
    if (/Edg\//.test(ua)) {
      const match = ua.match(/Edg\/(\d+)/);
      return `Edge ${match ? match[1] : ''}`.trim();
    }

    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
      const match = ua.match(/Chrome\/(\d+)/);
      return `Chrome ${match ? match[1] : ''}`.trim();
    }

    if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
      const match = ua.match(/Version\/(\d+)/);
      return `Safari ${match ? match[1] : ''}`.trim();
    }

    if (/Firefox\//.test(ua)) {
      const match = ua.match(/Firefox\/(\d+)/);
      return `Firefox ${match ? match[1] : ''}`.trim();
    }

    if (/Opera|OPR\//.test(ua)) {
      const match = ua.match(/(?:Opera|OPR)\/(\d+)/);
      return `Opera ${match ? match[1] : ''}`.trim();
    }

    return 'Unknown Browser';
  }

  /**
   * Clear cached fingerprint (useful for testing)
   */
  clearCache(): void {
    this.cachedFingerprint = null;
    this.cachedDeviceInfo = null;
  }
}

// Export singleton instance
export const deviceFingerprint = new DeviceFingerprintService();

