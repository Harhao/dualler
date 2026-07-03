// ---------------------------------------------------------------------------
// src/index.ts — Public API surface
// ---------------------------------------------------------------------------

export { App, getApp } from './app';
export type { AppOptions } from './app';

export { Page } from './page';
export { Component } from './component';
export { createReactiveData } from './observer';
export {
  navigateTo,
  redirectTo,
  switchTab,
  navigateBack,
  reLaunch,
  getRouteQueue,
  getLoader,
  setLoader,
} from './router';
export {
  registerErrorHandler,
  handleError,
  handleUnhandledRejection,
  initErrorHandling,
} from './errors';
export { initPageLifecycle } from './page';

// Also export collections for introspection / test fixtures.
export { registeredPages, getRegisteredPages, getPageStack } from './page';
export { registeredComponents, getRegisteredComponents } from './component';

// Types
export type {
  PageOptions,
  ComponentOptions,
  PropertyDef,
  PageInstance,
  ComponentInstance,
  RouterAction,
  NavigateOptions,
  ErrorHandler,
  RouteRecord,
} from './types';
export type { PageLoader } from './loader';
