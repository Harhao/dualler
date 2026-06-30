// ---------------------------------------------------------------------------
// src/component.ts — Component() API
// ---------------------------------------------------------------------------

import { ComponentOptions, ComponentInstance } from './types';

/* ---------------------------------------------------------------------------
 * Registered components — keyed by component name.
 * --------------------------------------------------------------------------- */

export const registeredComponents: Record<string, ComponentOptions> = {};

/* ---------------------------------------------------------------------------
 * Wrap every method in try/catch so a single component crash doesn't kill
 * the framework.
 * --------------------------------------------------------------------------- */

function wrapMethod<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'function') {
      out[key] = function (this: any, ...args: any[]) {
        try { return val.apply(this, args); }
        catch (e) {
          console.error('[dualler-runtime-core][Component]', e instanceof Error ? e.message : String(e));
          throw e;
        }
      };
    } else {
      out[key] = val;
    }
  }
  return out as T;
}

/** Wrap property observers so they capture errors. */
function wrapObservers(props: ComponentOptions['properties']): ComponentOptions['properties'] {
  if (!props) return props;
  const out: Record<string, any> = {};
  for (const [key, def] of Object.entries(props)) {
    if (typeof def !== 'object') continue;
    out[key] = { ...def };
    if (typeof def.observer === 'function') {
      out[key].observer = function (this: any, newVal: any, oldVal: any, changedPath: string) {
        try { return def.observer!.apply(this, [newVal, oldVal, changedPath]); }
        catch (e) {
          console.error('[dualler-runtime-core][Component observer]', e instanceof Error ? e.message : String(e));
        }
      };
    }
  }
  return out as ComponentOptions['properties'];
}

/* ---------------------------------------------------------------------------
 * Component() — entry point developers call.
 * --------------------------------------------------------------------------- */

export function Component<P = Record<string, any>, M = Record<string, any>, D = Record<string, any>>(
  options: ComponentOptions<P, M, D>,
): { name: string; options: ComponentOptions<P, M, D> } {
  const name = options.properties ? Object.keys(options.properties).join('/') : 'unnamed-component';

  const wrapped: ComponentOptions<P, M, D> = {
    ...options,
    properties: wrapObservers(options.properties),
    methods: options.methods ? wrapMethod(options.methods) : undefined,
  } as ComponentOptions<P, M, D>;

  registeredComponents[name] = wrapped as ComponentOptions;

  return { name, options: wrapped };
}

/* ---------------------------------------------------------------------------
 * Lookup helpers
 * --------------------------------------------------------------------------- */

export function getRegisteredComponents(): Record<string, ComponentOptions> {
  return { ...registeredComponents };
}
