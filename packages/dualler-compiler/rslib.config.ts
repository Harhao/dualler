import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2020'],
      source: {
        entry: {
          index: ['src/index.ts'],
        },
      },
      output: {
        target: 'node',
        externals: ['@vue/compiler-sfc'],
      },
    },
  ],
  source: {
    entry: {
      index: ['src/index.ts'],
    },
  },
});
