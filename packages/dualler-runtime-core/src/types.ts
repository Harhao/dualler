// ---------------------------------------------------------------------------
// src/types.ts — Core type definitions for Pages, Components, Router, Errors
// ---------------------------------------------------------------------------

/* Page lifecycle & options -------------------------------------------------- */

export interface PageOptions<TData = Record<string, any>, TCustom = Record<string, any>> {
  data?: TData;
  onLoad?(this: PageInstance<TData>, options?: Record<string, string>): void;
  onUnload?(this: PageInstance<TData>): void;
  onShow?(this: PageInstance<TData>): void;
  onHide?(this: PageInstance<TData>): void;
  onResize?(this: PageInstance<TData>, size: { windowWidth: number; windowHeight: number }): void;
  onPullDownRefresh?(this: PageInstance<TData>): void;
  onReachBottom?(this: PageInstance<TData>): void;
  onShareAppMessage?(this: PageInstance<TData>): void;
  [key: string]: any;
}

/* Component lifecycle & options --------------------------------------------- */

export interface PropertyDef<TType = any, TObserved = unknown> {
  type?: TType;
  value?: TObserved;
  optional?: boolean;
  observer?: (this: ComponentInstance<any, any>, newVal: TObserved, oldVal: TObserved, changedPath: string) => void;
}

export interface ComponentOptions<
  TProperties = Record<string, any>,
  TMethods = Record<string, (...args: any[]) => any>,
  TData = Record<string, any>,
> {
  properties?: { [K in keyof TProperties]: PropertyDef<any, TProperties[K]> };
  data?: TData;
  methods?: TMethods & ThisType<ComponentInstance<TProperties, TData>> & Record<string, any>;
  observers?: Partial<{ [K in keyof TData]: (newVal: TData[K], oldVal: TData[K]) => void }>;
  lifetimes?: {
    attached?: (this: ComponentInstance<TProperties, TData>) => void;
    detached?: (this: ComponentInstance<TProperties, TData>) => void;
    ready?: (this: ComponentInstance<TProperties, TData>) => void;
  };
}

/* Page instance — exposed to lifecycle hooks -------------------------------- */

export type PageInstance<D = Record<string, any>> = {
  $page: {
    options: Record<string, string>;
    route: string;
    fullPath: string;
  };
} & D

/* Component instance — exposed to lifecycle hooks --------------------------- */

export type ComponentInstance<P = Record<string, any>, D = Record<string, any>> = {
  $component: {
    isAttached: boolean;
  };
} & P & D

/* Router types -------------------------------------------------------------- */

export type RouterAction = 'navigateTo' | 'redirectTo' | 'switchTab' | 'navigateBack' | 'reLaunch';

export interface NavigateOptions {
  url: string;
  delta?: number;
  animationType?: 'pop-in' | 'pop-out' | 'push-in' | 'push-out';
  animationDuration?: number;
}

/* Error-handling types ------------------------------------------------------ */

export interface ErrorHandler {
  onError?: (error: Error) => void;
  onUnhandledRejection?: (reason: unknown) => void;
}

/* Route queue record -------------------------------------------------------- */

export interface RouteRecord {
  action: RouterAction;
  options: NavigateOptions & { delta?: number };
}
