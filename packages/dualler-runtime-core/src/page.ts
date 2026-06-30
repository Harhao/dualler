// ---------------------------------------------------------------------------
// src/page.ts — Page() API
// ---------------------------------------------------------------------------

import { PageOptions, PageInstance, ErrorHandler } from './types';
import { initErrorHandling, registerErrorHandler, handleError } from './errors';

/* ---------------------------------------------------------------------------
 * Registered pages — keyed by route name (derived from file path convention).
 * --------------------------------------------------------------------------- */

export const registeredPages: Record<string, PageOptions> = {};

/** Internal stack of open page routes (bottom → top). */
export const pageStack: string[] = [];

/* ---------------------------------------------------------------------------
 * Wrap every lifecycle function in try/catch so a single crash doesn't kill
 * the framework.
 * --------------------------------------------------------------------------- */

function wrapHook<T extends (...args: any[]) => any>(fn: T | undefined): T | undefined {
  if (!fn) return undefined;
  return ((...args: Parameters<T>) => {
    try { return fn(...args); }
    catch (e) { handleError(e instanceof Error ? e : new Error(String(e))); }
  }) as T;
}

function wrapOptions<TData>(opts: PageOptions<TData>): PageOptions<TData> {
  const wrapped: PageOptions<TData> = {};
  const keys: (keyof PageOptions<TData>)[] = [
    'onLoad', 'onUnload', 'onShow', 'onHide', 'onResize',
    'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage',
  ];
  for (const k of keys) {
    if (k in opts && typeof opts[k] === 'function') {
      (wrapped as any)[k] = wrapHook(opts[k]);
    }
  }
  // Copy remaining properties verbatim
  for (const k in opts) {
    if (!(k in wrapped)) (wrapped as any)[k] = (opts as any)[k];
  }
  return wrapped;
}

/* ---------------------------------------------------------------------------
 * Page() — entry point developers call.
 * --------------------------------------------------------------------------- */

export function Page<TData = Record<string, any>>(options: PageOptions<TData>): { route: string; options: PageOptions<TData> } {
  const wrapped = wrapOptions(options);

  // Derive a route name from the first function key present (convention hint).
  const inferRoute = (): string => {
    for (const k in wrapped) {
      if (k.startsWith('on')) return `pages/${k}`;
    }
    return 'unknown-page';
  };

  const route = inferRoute();
  (registeredPages as any)[route] = wrapped;

  return { route, options: wrapped as PageOptions<TData> };
}

/* ---------------------------------------------------------------------------
 * Lookup helpers
 * --------------------------------------------------------------------------- */

/** Resolve a route string for a given options object (by identity). */
export function getPageRoute(opts: PageOptions): string | undefined {
  for (const [route, o] of Object.entries(registeredPages)) {
    if (o === opts) return route;
  }
  return undefined;
}

export function getRegisteredPages(): Record<string, PageOptions> {
  return { ...registeredPages };
}

export function getPageStack(): string[] {
  return [...pageStack];
}

/* ---------------------------------------------------------------------------
 * Stack operations
 * --------------------------------------------------------------------------- */

export function pushPage(route: string): void {
  pageStack.push(route);
}

export function popPage(): string | undefined {
  return pageStack.pop();
}

/**
 * Initialise page-level concerns: error handling + lifecycle crash capture.
 *
 * Developers SHOULD call this once at app bootstrap (before any Page()/Component() calls).
 * It is a no-op if called multiple times.
 */

export function initPageLifecycle(): void {
  initErrorHandling();

  // Attach a global errorHandler so lifecycle crashes are captured.
  registerErrorHandler({
    onError(err) {
      // Already logged by handleError; here we could notify a monitoring
      // service or surface a dev-overlay in the editor.
      const pageName = pageStack[pageStack.length - 1] ?? '(unknown)';
      console.warn(`  -> page crash at [${pageName}]`);
    },
  });
}
