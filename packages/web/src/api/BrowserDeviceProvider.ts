/**
 * Browser Device Provider
 *
 * 浏览器设备信息提供者
 */

import type { DeviceProvider } from '../types/platform';
import type { SystemInfo, VibrateType, NetworkType } from '../types/models';

export class BrowserDeviceProvider implements DeviceProvider {
  getSystemInfo(): SystemInfo {
    return {
      brand: navigator.vendor || 'Unknown',
      model: navigator.userAgent || 'Browser',
      pixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      statusBarHeight: 0,
      language: navigator.language || 'en',
      version: navigator.appVersion || '1.0',
      platform: 'web',
      SDKVersion: '1.0.0'
    };
  }

  vibrate(type: VibrateType): void {
    if (!navigator.vibrate) {
      console.warn('Vibration API not supported');
      return;
    }

    const duration = this.getVibrateDuration(type);
    navigator.vibrate(duration);
  }

  getNetworkType(): NetworkType {
    // 使用 Network Information API（如果可用）
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'cellular_2g';
        case '3g':
          return 'cellular_3g';
        case '4g':
          return 'cellular_4g';
        default:
          return 'wifi';
      }
    }

    // 降级检测
    if (navigator.onLine === false) {
      return 'none';
    }

    return 'wifi';
  }

  private getVibrateDuration(type: VibrateType): number {
    switch (type) {
      case 'short':
        return 15;
      case 'long':
        return 400;
      case 'heavy':
        return 100;
      case 'medium':
        return 50;
      case 'light':
        return 10;
      default:
        return 15;
    }
  }
}
