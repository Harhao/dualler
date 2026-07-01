export interface ShowToastOptions {
  title: string;
  icon?: 'success' | 'error' | 'loading' | 'none';
  duration?: number;
  mask?: boolean;
  success?: () => void;
  fail?: (err: any) => void;
  complete?: () => void;
}

export function showToast(options: ShowToastOptions): void {
  const { title, icon = 'none', duration = 1500, mask = false, success, fail, complete } = options;

  // In a real implementation, this would send a message via the bridge to show a native toast.
  // For the framework scaffold, we simulate the behavior.
  console.log(`[dualler toast] icon=${icon} title="${title}" duration=${duration}`);

  const timer = setTimeout(() => {
    complete?.();
  }, duration);

  if (icon === 'loading') {
    // loading toast stays until explicitly hidden
    clearTimeout(timer);
  } else {
    success?.();
  }
}

export function hideToast(options?: { success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  console.log('[dualler toast] hidden');
  options?.success?.();
  options?.complete?.();
}

export function showLoading(options?: { title?: string; mask?: boolean; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  console.log(`[dualler loading] ${(options?.title ?? '').toString()}`);
  options?.success?.();
  options?.complete?.();
}

export function hideLoading(options?: { success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  console.log('[dualler loading] hidden');
  options?.success?.();
  options?.complete?.();
}
