/**
 * Lifecycle Mapping - Maps Vue3 lifecycle hooks to mini-program lifecycle events
 *
 * Vue3 Lifecycle → Mini-program Lifecycle
 * ─────────────────────────────────────────
 * setup()           → Component constructor / Page constructor
 * onBeforeMount     → onLoad (Page) / attached (Component)
 * onMounted         → onReady (Page) / ready (Component)
 * onActivated       → onShow (Page) / show (Component)
 * onDeactivated     → onHide (Page) / hide (Component)
 * onBeforeUnmount   → onUnload (Page) / detached (Component)
 * onUnmounted       → onUnload (Page) / detached (Component)
 * onBeforeUpdate    → (before setData)
 * onUpdated         → (after setData)
 * onErrorCaptured   → onError (Page/Component)
 */

export type LifecycleHook =
  | 'onBeforeMount'
  | 'onMounted'
  | 'onBeforeUpdate'
  | 'onUpdated'
  | 'onBeforeUnmount'
  | 'onUnmounted'
  | 'onActivated'
  | 'onDeactivated'
  | 'onErrorCaptured';

export type PageLifecycle =
  | 'onLoad'
  | 'onReady'
  | 'onShow'
  | 'onHide'
  | 'onUnload'
  | 'onError'
  | 'onPullDownRefresh'
  | 'onReachBottom'
  | 'onShareAppMessage'
  | 'onPageScroll';

export type ComponentLifecycle =
  | 'created'
  | 'attached'
  | 'ready'
  | 'detached'
  | 'moved'
  | 'error';

/** Vue lifecycle → Dualler runtime function name */
export const VUE_TO_DUALLER_LIFECYCLE: Record<LifecycleHook, string> = {
  onBeforeMount: '__dualler_onBeforeMount',
  onMounted: '__dualler_onReady',
  onBeforeUpdate: '__dualler_onBeforeUpdate',
  onUpdated: '__dualler_onUpdated',
  onBeforeUnmount: '__dualler_onBeforeUnload',
  onUnmounted: '__dualler_onUnload',
  onActivated: '__dualler_onShow',
  onDeactivated: '__dualler_onHide',
  onErrorCaptured: '__dualler_onErrorCaptured',
};

/** Vue lifecycle → Page lifecycle event */
export const VUE_TO_PAGE_LIFECYCLE: Record<LifecycleHook, PageLifecycle> = {
  onBeforeMount: 'onLoad',
  onMounted: 'onReady',
  onActivated: 'onShow',
  onDeactivated: 'onHide',
  onBeforeUnmount: 'onUnload',
  onUnmounted: 'onUnload',
  onBeforeUpdate: 'onLoad', // No direct mapping
  onUpdated: 'onReady', // No direct mapping
  onErrorCaptured: 'onError',
};

/** Vue lifecycle → Component lifecycle event */
export const VUE_TO_COMPONENT_LIFECYCLE: Record<LifecycleHook, ComponentLifecycle> = {
  onBeforeMount: 'attached',
  onMounted: 'ready',
  onActivated: 'attached',
  onDeactivated: 'detached',
  onBeforeUnmount: 'detached',
  onUnmounted: 'detached',
  onBeforeUpdate: 'attached', // No direct mapping
  onUpdated: 'ready', // No direct mapping
  onErrorCaptured: 'error',
};

/**
 * Generate Page lifecycle handlers that call Vue lifecycle hooks
 */
export function generatePageLifecycleHandlers(hooks: LifecycleHook[]): string {
  const handlers: string[] = [];

  for (const hook of hooks) {
    const duallerFn = VUE_TO_DUALLER_LIFECYCLE[hook];
    const pageLifecycle = VUE_TO_PAGE_LIFECYCLE[hook];

    if (pageLifecycle === 'onLoad') {
      handlers.push(`
    onLoad: function(options) {
      if (typeof ${duallerFn} === 'function') ${duallerFn}(options);
    }`);
    } else if (pageLifecycle === 'onReady') {
      handlers.push(`
    onReady: function() {
      if (typeof ${duallerFn} === 'function') ${duallerFn}();
    }`);
    } else if (pageLifecycle === 'onShow') {
      handlers.push(`
    onShow: function() {
      if (typeof ${duallerFn} === 'function') ${duallerFn}();
    }`);
    } else if (pageLifecycle === 'onHide') {
      handlers.push(`
    onHide: function() {
      if (typeof ${duallerFn} === 'function') ${duallerFn}();
    }`);
    } else if (pageLifecycle === 'onUnload') {
      handlers.push(`
    onUnload: function() {
      if (typeof ${duallerFn} === 'function') ${duallerFn}();
    }`);
    }
  }

  return handlers.join(',\n');
}

/**
 * Generate Component lifecycle handlers
 */
export function generateComponentLifecycleHandlers(hooks: LifecycleHook[]): string {
  const attachedHooks: string[] = [];
  const detachedHooks: string[] = [];
  const readyHooks: string[] = [];

  for (const hook of hooks) {
    const duallerFn = VUE_TO_DUALLER_LIFECYCLE[hook];
    const compLifecycle = VUE_TO_COMPONENT_LIFECYCLE[hook];

    if (compLifecycle === 'attached') {
      attachedHooks.push(`if (typeof ${duallerFn} === 'function') ${duallerFn}();`);
    } else if (compLifecycle === 'detached') {
      detachedHooks.push(`if (typeof ${duallerFn} === 'function') ${duallerFn}();`);
    } else if (compLifecycle === 'ready') {
      readyHooks.push(`if (typeof ${duallerFn} === 'function') ${duallerFn}();`);
    }
  }

  const handlers: string[] = [];

  if (attachedHooks.length > 0) {
    handlers.push(`attached: function() { ${attachedHooks.join(' ')} }`);
  }
  if (readyHooks.length > 0) {
    handlers.push(`ready: function() { ${readyHooks.join(' ')} }`);
  }
  if (detachedHooks.length > 0) {
    handlers.push(`detached: function() { ${detachedHooks.join(' ')} }`);
  }

  return handlers.join(',\n');
}
