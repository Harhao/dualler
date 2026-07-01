import { compile } from '@dualler/compiler';

export function transformVue(source: string, id: string) {
  try {
    const result = compile(source, {
      source,
      filename: id,
    });
    return {
      code: JSON.stringify(result),
      map: null,
    };
  } catch (err) {
    console.error(`[dualler-vite] Failed to compile ${id}:`, err);
    return null;
  }
}
