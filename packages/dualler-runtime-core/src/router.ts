// ---------------------------------------------------------------------------
// src/router.ts — Page routing & navigation with WebView lifecycle
// ---------------------------------------------------------------------------

import { RouterAction, NavigateOptions, RouteRecord } from './types';
import { pushPage, popPage, getPageStack, registeredPages } from './page';
import { DefaultPageLoader, PageLoader } from './loader';
import { getApp } from './app';

/* ---------------------------------------------------------------------------
 * Queue of pending navigation actions.
 * --------------------------------------------------------------------------- */

export const routeQueue: RouteRecord[] = [];

/* ---------------------------------------------------------------------------
 * Default loader instance — can be swapped via setLoader().
 * SDKs replace this with their native bridge loader.
 * --------------------------------------------------------------------------- */

let _loader: PageLoader = new DefaultPageLoader();

export function getLoader(): PageLoader {
  return _loader;
}

export function setLoader(loader: PageLoader): void {
  _loader = loader;
}

/* ---------------------------------------------------------------------------
 * Public navigation functions
 * --------------------------------------------------------------------------- */

/** Push a new page onto the stack. */
export function navigateTo(options: NavigateOptions): void {
  routeQueue.push({ action: 'navigateTo', options });
  flushRouteQueue();
}

/** Replace the current page on the stack. */
export function redirectTo(options: NavigateOptions): void {
  routeQueue.push({ action: 'redirectTo', options });
  flushRouteQueue();
}

/** Jump to a tab-bar page (clears the stack above the tab target). */
export function switchTab(options: NavigateOptions): void {
  routeQueue.push({ action: 'switchTab', options });
  flushRouteQueue();
}

/** Go back `delta` pages (default 1). */
export function navigateBack(options?: { delta?: number }): void {
  const delta = options?.delta ?? 1;
  const stack = getPageStack();
  for (let i = 0; i < delta; i++) {
    const popped = popPage();
    if (!popped) break;
  }
}

/** Full app reload — discard everything and go to the given route. */
export function reLaunch(options: NavigateOptions): void {
  routeQueue.push({ action: 'reLaunch', options });
  flushRouteQueue();
}

/* ---------------------------------------------------------------------------
 * Internal processing
 * --------------------------------------------------------------------------- */

export function getRouteQueue(): RouteRecord[] {
  return [...routeQueue];
}

/** Flush every queued navigation action immediately. */
export function flushRouteQueue(): void {
  while (routeQueue.length > 0) {
    const record = routeQueue.shift()!;
    executeRoute(record.action, record.options);
  }
}

/** Execute a single navigation action against the internal page stack. */
function executeRoute(action: RouterAction, options: NavigateOptions & { delta?: number }): void {
  const app = getApp();

  switch (action) {
    case 'navigateTo':
      // Load page resources before pushing to stack.
      _loader.loadPage(options.url).catch(() => {});
      pushPage(options.url);
      app._stackLength = getPageStack().length;
      try { (app as any).onShow?.(); } catch (_) { /* swallow */ }
      break;

    case 'redirectTo': {
      const current = popPage();
      if (current) {
        _loader.unloadPage(current);
      }
      _loader.loadPage(options.url).catch(() => {});
      pushPage(options.url);
      app._stackLength = getPageStack().length;
      try { (app as any).onShow?.(); } catch (_) { /* swallow */ }
      break;
    }

    case 'switchTab': {
      // Walk down the stack removing everything above the tab root.
      const stack = getPageStack();
      const idx = stack.lastIndexOf(options.url);
      // Unload pages above the tab.
      while (stack.length > idx + 1) {
        const popped = popPage();
        if (popped) _loader.unloadPage(popped);
      }
      if (idx === -1) {
        // Tab not on stack — load and push.
        _loader.loadPage(options.url).catch(() => {});
        pushPage(options.url);
      }
      app._stackLength = getPageStack().length;
      try { (app as any).onShow?.(); } catch (_) { /* swallow */ }
      break;
    }

    case 'reLaunch': {
      // Unload all current pages.
      while (getPageStack().length > 0) {
        const popped = popPage();
        if (popped) _loader.unloadPage(popped);
      }
      _loader.loadPage(options.url).catch(() => {});
      pushPage(options.url);
      app._stackLength = getPageStack().length;
      try { (app as any).onHide?.(); } catch (_) { /* swallow */ }
      try { (app as any).onShow?.(); } catch (_) { /* swallow */ }
      break;
    }

    case 'navigateBack': {
      const delta = options.delta ?? 1;
      for (let i = 0; i < delta; i++) {
        const popped = popPage();
        if (!popped) break;
        _loader.unloadPage(popped);
      }
      app._stackLength = getPageStack().length;
      if (getPageStack().length === 0) {
        try { (app as any).onHide?.(); } catch (_) { /* swallow */ }
      } else {
        try { (app as any).onShow?.(); } catch (_) { /* swallow */ }
      }
      break;
    }
  }
}
