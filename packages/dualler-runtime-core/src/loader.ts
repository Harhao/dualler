// ---------------------------------------------------------------------------
// src/loader.ts — Page bundle & CSS loader (decoupled from WebView concerns)
// ---------------------------------------------------------------------------

import { handleError } from './errors';

/* ---------------------------------------------------------------------------
 * PageLoader interface — SDK implementations can swap in custom loaders.
 * --------------------------------------------------------------------------- */

export interface PageLoader {
  /** Resolve a route string to its bundle path (e.g. "pages/detail/detail" → "pages/detail/detail.js"). */
  resolveBundlePath(route: string): string;
  /** Resolve a route string to its CSS path. */
  resolveCssPath(route: string): string;
  /** Load and evaluate the page bundle. Returns true if newly loaded. */
  loadPage(route: string): Promise<boolean>;
  /** Unload page resources (remove CSS, call onUnload). */
  unloadPage(route: string): void;
}

/* ---------------------------------------------------------------------------
 * Default PageLoader — resolves paths relative to dist root.
 * In a real SDK this would be replaced by a native bridge loader.
 * --------------------------------------------------------------------------- */

export class DefaultPageLoader implements PageLoader {
  /** Track which pages have been loaded to avoid duplicates. */
  private _loaded = new Set<string>();
  /** Track loaded CSS elements by route for cleanup. */
  private _cssElements = new Map<string, HTMLStyleElement>();

  resolveBundlePath(route: string): string {
    return `${route}/${this._pageName(route)}.js`;
  }

  resolveCssPath(route: string): string {
    return `${route}/${this._pageName(route)}.css`;
  }

  private _pageName(route: string): string {
    return route.split('/').pop() ?? route;
  }

  /**
   * Load a page's bundle and CSS.
   * - Evaluates the JS bundle (registers the page if not already registered).
   * - Injects the CSS into <head>.
   * - Returns true if this was a fresh load, false if already loaded (idempotent).
   */
  async loadPage(route: string): Promise<boolean> {
    if (this._loaded.has(route)) {
      return false; // already loaded, idempotent
    }

    try {
      const bundlePath = this.resolveBundlePath(route);
      const cssPath = this.resolveCssPath(route);

      // Fetch and evaluate the JS bundle.
      const jsResp = await this._fetchText(bundlePath);
      if (jsResp) {
        // eslint-disable-next-line no-eval
        eval(jsResp);
      }

      // Inject CSS.
      const cssText = await this._fetchText(cssPath);
      if (cssText) {
        this._injectCss(route, cssText);
      }

      this._loaded.add(route);
      return true;
    } catch (e) {
      handleError(e instanceof Error ? e : new Error(String(e)));
      return false;
    }
  }

  /**
   * Unload a page: remove its CSS element and call onUnload hook.
   */
  unloadPage(route: string): void {
    // Remove CSS.
    const el = this._cssElements.get(route);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    this._cssElements.delete(route);

    // Call onUnload hook if the page instance exists.
    try {
      const pageOptions = (globalThis as any).__dualler_registeredPages?.[route];
      if (pageOptions && typeof (pageOptions as any).onUnload === 'function') {
        (pageOptions as any).onUnload.call(null);
      }
    } catch (e) {
      handleError(e instanceof Error ? e : new Error(String(e)));
    }

    this._loaded.delete(route);
  }

  isLoading(route: string): boolean {
    return this._loaded.has(route);
  }

  private async _fetchText(url: string): Promise<string | null> {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return await resp.text();
    } catch {
      return null;
    }
  }

  private _injectCss(route: string, cssText: string): void {
    if (this._cssElements.has(route)) return; // already injected
    const style = document.createElement('style');
    style.setAttribute('data-dualler-page', route);
    style.textContent = cssText;
    document.head.appendChild(style);
    this._cssElements.set(route, style);
  }
}
