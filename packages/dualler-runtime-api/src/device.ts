// Safe type guards for browser globals that may not exist in all JS environments
declare global {
  var __DUALLER_GLOBAL__: Record<string, unknown> | undefined;
}

interface NavigatorLike {
  userAgent: string;
  platform: string;
}

interface ScreenLike {
  width: number;
  height: number;
}

interface WindowLike {
  innerWidth: number;
  innerHeight: number;
}

function getNavigator(): NavigatorLike | undefined {
  if (typeof globalThis !== 'undefined' && (globalThis as any).navigator) {
    return (globalThis as any).navigator as NavigatorLike;
  }
  return undefined;
}

function getScreen(): ScreenLike | undefined {
  if (typeof globalThis !== 'undefined' && (globalThis as any).screen) {
    return (globalThis as any).screen as ScreenLike;
  }
  return undefined;
}

function getWindow(): WindowLike | undefined {
  if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
    return (globalThis as any).window as WindowLike;
  }
  return undefined;
}

export interface SystemInfo {
  brand: string;
  model: string;
  system: string;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  statusBarHeight: number;
  platform: 'ios' | 'android' | 'devtools';
  fontSizeSetting: number;
  SDKVersion: string;
  benchmarkLevel: number;
  albumAuthorized: boolean;
  cameraAuthorized: boolean;
  locationAuthorized: boolean;
  microphoneAuthorized: boolean;
  notificationAuthorized: boolean;
  notificationAlertAuthorized: boolean;
  notificationBadgeAuthorized: boolean;
  notificationMarqueeAuthorized: boolean;
}

function _getBaseInfo(): SystemInfo {
  const nav = getNavigator();
  const ua = nav?.userAgent ?? '';
  let platform: 'ios' | 'android' | 'devtools' = 'devtools';
  if (/iphone|ipad|ios/i.test(ua)) platform = 'ios';
  else if (/android/i.test(ua)) platform = 'android';

  const scr = getScreen();
  const win = getWindow();

  return {
    brand: 'unknown',
    model: nav?.platform ?? 'unknown',
    system: platform === 'ios' ? 'iOS' : 'Android',
    screenWidth: scr?.width ?? 375,
    screenHeight: scr?.height ?? 667,
    windowWidth: win?.innerWidth ?? 375,
    windowHeight: win?.innerHeight ?? 667,
    statusBarHeight: 20,
    platform,
    fontSizeSetting: 16,
    SDKVersion: '0.1.0',
    benchmarkLevel: 0,
    albumAuthorized: true,
    cameraAuthorized: true,
    locationAuthorized: true,
    microphoneAuthorized: true,
    notificationAuthorized: true,
    notificationAlertAuthorized: true,
    notificationBadgeAuthorized: true,
    notificationMarqueeAuthorized: true,
  };
}

export function getSystemInfoSync(): SystemInfo {
  return _getBaseInfo();
}

export function getSystemInfo(options?: {
  success?: (res: SystemInfo) => void;
  fail?: (err: any) => void;
  complete?: () => void;
}): void {
  const info = getSystemInfoSync();
  options?.success?.(info);
  options?.complete?.();
}

export function getWindowInfo(): SystemInfo {
  return getSystemInfoSync();
}
