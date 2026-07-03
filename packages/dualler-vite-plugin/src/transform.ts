import { compileToBundle } from '@dualler/compiler';

export function transformVue(source: string, id: string) {
  try {
    const bundleJs = compileToBundle(source, {
      source,
      filename: id,
    });
    return {
      code: bundleJs,
      map: null,
    };
  } catch (err) {
    console.error(`[dualler-vite] Failed to compile ${id}:`, err);
    return null;
  }
}
