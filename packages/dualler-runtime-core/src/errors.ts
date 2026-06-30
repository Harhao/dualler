// ---------------------------------------------------------------------------
// src/errors.ts — Global error & rejection handling
// ---------------------------------------------------------------------------

import { ErrorHandler } from './types';

let handlers: ErrorHandler[] = [];

/** Register one or more error handlers. */
export function registerErrorHandler(handler: ErrorHandler): void {
  handlers.push(handler);
}

/** Dispatch an Error to every registered handler. */
export function handleError(error: Error): void {
  const formatted = typeof error === 'string' ? error : error.stack ?? error.message ?? String(error);
  console.error('[dualler-runtime-core]', formatted);
  for (const h of handlers) {
    try { h.onError?.(error); } catch (_) { /* swallow handler failures */ }
  }
}

/** Dispatch an unhandled-promise rejection to every registered handler. */
export function handleUnhandledRejection(reason: unknown): void {
  const formatted = reason instanceof Error
    ? reason.stack ?? reason.message
    : String(reason);
  console.warn('[dualler-runtime-core] unhandledRejection:', formatted);
  for (const h of handlers) {
    try { h.onUnhandledRejection?.(reason); } catch (_) { /* swallow handler failures */ }
  }
}

/** Install global `onerror` / `onunhandledrejection` listeners. */
export function initErrorHandling(): void {
  if ((typeof globalThis !== 'undefined' && (globalThis as any).__DUALLER_ERROR_HANDLING_INIT)) return;
  (globalThis as any).__DUALLER_ERROR_HANDLING_INIT = true;

  if (typeof window !== 'undefined') {
    window.onerror = (_msg, _source, _lineno, _colno, error) => {
      handleError(error instanceof Error ? error : new Error(String(error)));
      return false; // let default handler run too
    };
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      handleUnhandledRejection(event.reason);
    };
  }
}
