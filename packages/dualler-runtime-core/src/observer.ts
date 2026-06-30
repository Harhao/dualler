// ---------------------------------------------------------------------------
// src/observer.ts — Fine-grained reactive data binding
// ---------------------------------------------------------------------------

/* ---------------------------------------------------------------------------
 * Internal interface shared between instance and ReactiveData.
 * --------------------------------------------------------------------------- */

interface ObserverCallback {
  (newVal: any, oldVal: any): void;
}

interface PendingObserver {
  path: string;         // dot-notation path, e.g. "user.address.city"
  callback: ObserverCallback;
}

/* ---------------------------------------------------------------------------
 * ReactiveData — wraps a plain-data object and exposes path-based observers.
 * --------------------------------------------------------------------------- */

export class ReactiveData<T extends Record<string, any>> {
  private data: T;
  private observers: PendingObserver[] = [];

  constructor(data: T, private _target: any) {
    this.data = data;
    // Mutate the target in-place so that components/pages that received a
    // shallow copy of data continue to see live values.
    Object.assign(_target, this._makeReactive(data));
  }

  /* ---- helpers ---------------------------------------------------------- */

  /** Shallow-reactive wrapper: assigns new values and triggers observers. */
  private _makeReactive(obj: T): T {
    const proxy: any = {};
    for (const key of Object.keys(obj)) {
      Object.defineProperty(proxy, key, {
        configurable: true,
        enumerable: true,
        get() { return obj[key]; },
        set(newVal) {
          const oldVal = obj[key];
          (this.data as any)[key] = newVal;
          this._notify(key, newVal, oldVal);
        },
      });
    }
    return proxy as T;
  }

  private _notify(changedKey: string, newVal: any, oldVal: any): void {
    const fullPath = changedKey;
    for (const obs of this.observers) {
      // Trigger if the observed path equals the changed key or is a child
      // of it (e.g. observing "a" fires when "a.b" changes).
      if (obs.path === fullPath || fullPath.startsWith(obs.path + '.')) {
        try { obs.callback(newVal, oldVal); } catch (_) { /* ignore */ }
      }
    }
  }

  /* ---- public API ------------------------------------------------------- */

  /** Get a snapshot of the current data object. */
  get(): T {
    return { ...this.data };
  }

  /** Merge updates into data and notify observers. */
  set(updates: Partial<T>): void {
    for (const key of Object.keys(updates)) {
      const newVal = updates[key];
      const oldVal = this.data[key];
      (this.data as any)[key] = newVal;
      this._notify(key, newVal, oldVal);
    }
  }

  /** Register an observer for a specific path (dot-notation). */
  observe(path: string, callback: ObserverCallback): void {
    this.observers.push({ path, callback });
  }

  /** Resolve a dotted path on the data object. */
  private _getDataAtPath(path: string): any {
    const parts = path.split('.');
    let cur: any = this.data;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }
}

/* ---------------------------------------------------------------------------
 * Factory
 * --------------------------------------------------------------------------- */

export function createReactiveData<T extends Record<string, any>>(
  data: T,
  target: any,
): ReactiveData<T> {
  return new ReactiveData(data, target);
}
