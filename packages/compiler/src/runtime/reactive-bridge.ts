/**
 * Reactive Bridge - Generates runtime code for Vue reactivity → setData synchronization
 *
 * This module generates JavaScript code that intercepts Vue's reactive system
 * and automatically calls setData to sync changes to the render layer.
 */

export interface ReactiveBridgeOptions {
  /** Reactive variables that need setData binding */
  reactiveVars: string[];
  /** Template dependencies (variables used in template) */
  templateDeps: string[];
  /** Whether this is a page or component */
  type: 'page' | 'component';
}

/**
 * Generate runtime code for reactive → setData bridge
 *
 * This code is injected into the page/component JS to automatically
 * sync reactive variable changes to the WebView render layer.
 */
export function generateReactiveBridge(options: ReactiveBridgeOptions): string {
  const { reactiveVars, templateDeps, type } = options;

  // Filter to only variables that appear in template
  const boundVars = reactiveVars.filter(v =>
    templateDeps.length === 0 || templateDeps.includes(v)
  );

  if (boundVars.length === 0) {
    return '';
  }

  const dataUpdates = boundVars.map(v => {
    return `      '${v}': __dualler_getValue(${v})`;
  }).join(',\n');

  return `
// Dualler Reactive Bridge
// Auto-syncs reactive variables to render layer via setData
(function() {
  var __dualler_bound_vars__ = [${boundVars.map(v => `'${v}'`).join(', ')}];

  function __dualler_getValue(val) {
    if (val && typeof val === 'object' && 'value' in val) {
      return val.value; // ref
    }
    return val;
  }

  function __dualler_syncData(instance) {
    var data = {
${dataUpdates}
    };
    instance.setData(data);
  }

  // Intercept ref/reactive setters
  var __dualler_original_ref = __dualler_ref;
  var __dualler_original_reactive = __dualler_reactive;

  __dualler_ref = function(initialValue) {
    var ref = __dualler_original_ref(initialValue);
    var originalSet = Object.getOwnPropertyDescriptor(ref, 'value')?.set;

    if (originalSet) {
      Object.defineProperty(ref, 'value', {
        get: function() { return originalSet.call(ref); },
        set: function(newVal) {
          originalSet.call(ref, newVal);
          // Schedule setData on next tick
          Promise.resolve().then(function() {
            if (typeof __dualler_page_instance__ !== 'undefined') {
              __dualler_syncData(__dualler_page_instance__);
            }
          });
        },
        enumerable: true,
        configurable: true
      });
    }

    return ref;
  };

  __dualler_reactive = function(initialValue) {
    var state = __dualler_original_reactive(initialValue);
    // Proxy-based interception for reactive objects
    return new Proxy(state, {
      set: function(target, prop, value) {
        target[prop] = value;
        // Schedule setData on next tick
        Promise.resolve().then(function() {
          if (typeof __dualler_page_instance__ !== 'undefined') {
            __dualler_syncData(__dualler_page_instance__);
          }
        });
        return true;
      }
    });
  };
})();
`.trim();
}

/**
 * Generate setData wrapper for a specific variable update
 */
export function generateSetDataCall(varName: string, valueExpr: string): string {
  return `this.setData({ '${varName}': ${valueExpr} });`;
}

/**
 * Generate path-based setData for nested updates
 * Example: list[0].name = 'new' → setData({ 'list[0].name': 'new' })
 */
export function generatePathSetData(path: string, valueExpr: string): string {
  return `this.setData({ '${path}': ${valueExpr} });`;
}
