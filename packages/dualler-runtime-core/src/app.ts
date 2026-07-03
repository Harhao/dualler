// ---------------------------------------------------------------------------
// src/app.ts — App() API (similar to WeChat Mini Program App)
// ---------------------------------------------------------------------------

import { handleError } from './errors';

/* ---------------------------------------------------------------------------
 * Global app instance — singleton accessed via getApp().
 * --------------------------------------------------------------------------- */

interface AppInstance {
  /** Raw options passed to App() */
  options: AppOptions;
  /** Global shared data */
  globalData: Record<string, any>;
  /** Default window config inherited by all pages */
  window: Record<string, any>;
  /** Current page stack length (updated by router) */
  _stackLength: number;
}

let _appInstance: AppInstance | undefined;

/** Get the global app instance. Should be called after App(). */
export function getApp<TData = Record<string, any>>(): AppInstance & TData {
  if (!_appInstance) {
    console.warn('[dualler] getApp() called before App() was registered.');
  }
  return _appInstance as unknown as AppInstance & TData;
}

/* ---------------------------------------------------------------------------
 * AppOptions type definition
 * --------------------------------------------------------------------------- */

export interface AppOptions {
  /** Called once when the app initializes. Receives launch options. */
  onLaunch?(this: AppInstance & Record<string, any>, options: { query: Record<string, string>; scene: number }): void;
  /** Called when the app shows (on launch + when stack goes from 1→0). */
  onShow?(this: AppInstance & Record<string, any>, options?: { query: Record<string, string>; scene: number }): void;
  /** Called when the app hides (page stack becomes empty after having pages). */
  onHide?(this: AppInstance & Record<string, any>): void;
  /** Global shared data accessible via getApp().globalData */
  globalData?: Record<string, any>;
  /** Default window configuration inherited by all pages. */
  window?: Record<string, any>;
  // Allow arbitrary extra fields for flexibility.
  [key: string]: any;
}

/* ---------------------------------------------------------------------------
 * App() — the entry-point function developers call.
 * --------------------------------------------------------------------------- */

export function App(options: AppOptions): AppInstance {
  if (_appInstance) {
    console.warn('[dualler] App() already registered. Subsequent calls are ignored.');
    return _appInstance;
  }

  const globalData = options.globalData ?? {};
  const win = { ...(options.window ?? {}) };

  const instance: AppInstance = {
    options,
    globalData,
    window: win,
    _stackLength: 0,
  };

  // Bind lifecycle hooks to the instance so `this` works inside them.
  if (options.onLaunch) {
    (instance as any).onLaunch = options.onLaunch.bind(instance);
  }
  if (options.onShow) {
    (instance as any).onShow = options.onShow.bind(instance);
  }
  if (options.onHide) {
    (instance as any).onHide = options.onHide.bind(instance);
  }

  _appInstance = instance;

  // Invoke onLaunch immediately with launch options.
  try {
    if ((instance as any).onLaunch) {
      (instance as any).onLaunch({ query: {}, scene: 0 });
    }
  } catch (e) {
    handleError(e instanceof Error ? e : new Error(String(e)));
  }

  // onShow fires on first launch too.
  try {
    if ((instance as any).onShow) {
      (instance as any).onShow({ query: {}, scene: 0 });
    }
  } catch (e) {
    handleError(e instanceof Error ? e : new Error(String(e)));
  }

  return instance;
}
