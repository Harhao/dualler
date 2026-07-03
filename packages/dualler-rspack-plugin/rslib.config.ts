import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      syntax: ['es2020'],
      source: {
        entry: {
          index: ['src/index.ts'],
        },
      },
      output: {
        target: 'node',
        externals: ['@rspack/core'],
      },
    },
  ],
  source: {
    entry: {
      index: ['src/index.ts'],
    },
  },
});
