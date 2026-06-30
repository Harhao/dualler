// ---------------------------------------------------------------------------
// src/router.ts — Page routing & navigation
// ---------------------------------------------------------------------------

import { RouterAction, NavigateOptions, RouteRecord } from './types';
import { pushPage, popPage, getPageStack } from './page';

/* ---------------------------------------------------------------------------
 * Queue of pending navigation actions.
 * --------------------------------------------------------------------------- */

export const routeQueue: RouteRecord[] = [];

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
  switch (action) {
    case 'navigateTo':
      pushPage(options.url);
      break;

    case 'redirectTo':
      popPage();           // remove current
      pushPage(options.url); // push new
      break;

    case 'switchTab': {
      // Walk down the stack removing everything above the tab root.
      const idx = getPageStack().lastIndexOf(options.url);
      while (getPageStack().length > idx + 1) popPage();
      if (idx === -1) pushPage(options.url);
      break;
    }

    case 'reLaunch':
      while (getPageStack().length > 0) popPage();
      pushPage(options.url);
      break;

    case 'navigateBack': {
      const delta = options.delta ?? 1;
      for (let i = 0; i < delta; i++) {
        if (!popPage()) break;
      }
      break;
    }
  }
}
