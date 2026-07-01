const STORAGE_KEY_PREFIX = '__dualler_storage__:';

function _key(key: string): string {
  return STORAGE_KEY_PREFIX + key;
}

// Simple in-memory store
const _memoryStore = new Map<string, string>();

function _get<T = any>(rawKey: string): T | null {
  const raw = _memoryStore.get(rawKey);
  if (raw === undefined) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function _set(rawKey: string, data: any): void {
  try {
    _memoryStore.set(rawKey, JSON.stringify(data));
  } catch {
    // Storage full -- silently ignore in framework scaffold
  }
}

// -- synchronous APIs ----------------------------------------------------------

export function setStorageSync(key: string, data: any): void {
  _set(_key(key), data);
}

export function getStorageSync<T = any>(key: string): T {
  return _get<T>(_key(key)) as T;
}

export function removeStorageSync(key: string): void {
  _memoryStore.delete(_key(key));
}

export function clearStorageSync(): void {
  const prefix = STORAGE_KEY_PREFIX;
  const keysToRemove: string[] = [];
  _memoryStore.forEach((_, k) => {
    if (k.startsWith(prefix)) keysToRemove.push(k);
  });
  for (const k of keysToRemove) {
    _memoryStore.delete(k);
  }
}

export function getStorageInfoSync(): { keys: string[]; currentSize: number; maxSize: number } {
  const prefix = STORAGE_KEY_PREFIX;
  const keys: string[] = [];
  _memoryStore.forEach((_, k) => {
    if (k.startsWith(prefix)) {
      keys.push(k.replace(prefix, ''));
    }
  });
  return {
    keys,
    currentSize: keys.length,
    maxSize: 5 * 1024 * 1024, // 5 MB
  };
}

// -- async APIs ----------------------------------------------------------------

export function setStorage(options: { key: string; data: any; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  try {
    setStorageSync(options.key, options.data);
    options.success?.();
    options.complete?.();
  } catch (e) {
    options.fail?.({ errMsg: String(e) });
    options.complete?.();
  }
}

export function getStorage<T = any>(options: { key: string; success?: (res: { data: T }) => void; fail?: (err: any) => void; complete?: () => void }): void {
  try {
    const data = getStorageSync<T>(options.key);
    options.success?.({ data });
    options.complete?.();
  } catch (e) {
    options.fail?.({ errMsg: String(e) });
    options.complete?.();
  }
}

export function removeStorage(options: { key: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  try {
    removeStorageSync(options.key);
    options.success?.();
    options.complete?.();
  } catch (e) {
    options.fail?.({ errMsg: String(e) });
    options.complete?.();
  }
}

export function getStorageInfo(options?: { success?: (res: any) => void; fail?: (err: any) => void; complete?: () => void }): void {
  try {
    const info = getStorageInfoSync();
    options?.success?.(info);
    options?.complete?.();
  } catch (e) {
    options?.fail?.({ errMsg: String(e) });
    options?.complete?.();
  }
}

export function clearStorage(options?: { success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
  try {
    clearStorageSync();
    options?.success?.();
    options?.complete?.();
  } catch (e) {
    options?.fail?.({ errMsg: String(e) });
    options?.complete?.();
  }
}
