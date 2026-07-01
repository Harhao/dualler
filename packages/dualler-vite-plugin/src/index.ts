import type { Plugin } from 'vite';
import { transformVue } from './transform';

export function duallerVitePlugin(): Plugin {
  return {
    name: 'dualler-vite',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.vue')) return null;
      return transformVue(code, id);
    },
  };
}
