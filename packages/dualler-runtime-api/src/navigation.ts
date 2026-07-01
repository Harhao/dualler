import type { RouterAction, NavigateOptions } from '@dualler/runtime-core';

type NavCallbackOptions = {
  success?: () => void;
  fail?: (err: any) => void;
  complete?: () => void;
};

function _invoke(action: RouterAction, options: NavigateOptions & NavCallbackOptions): void {
  const { url, success, fail, complete } = options;
  console.log(`[dualler router] ${action}: ${url}`);
  success?.();
  complete?.();
}

export function navigateTo(options: NavigateOptions & NavCallbackOptions): void {
  _invoke('navigateTo', options);
}

export function redirectTo(options: NavigateOptions & NavCallbackOptions): void {
  _invoke('redirectTo', options);
}

export function switchTab(options: NavigateOptions & NavCallbackOptions): void {
  _invoke('switchTab', options);
}

export function navigateBack(options?: { delta?: number; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  const delta = options?.delta ?? 1;
  console.log(`[dualler router] navigateBack: delta=${delta}`);
  options?.success?.();
  options?.complete?.();
}

export function reLaunch(options: NavigateOptions & NavCallbackOptions): void {
  _invoke('reLaunch', options);
}
