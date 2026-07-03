import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['es2020'],
      bundle: {
        externals: [
          'commander',
          'ink',
          'ink-select-input',
          'ink-text-input',
          'ink-spinner',
          'react',
          'react/jsx-runtime',
          'yoga-layout',
          'chokidar',
        ],
      },
      source: {
        entry: {
          index: ['src/index.tsx'],
        },
      },
      output: {
        filenameHash: false,
        target: 'node',
      },
    },
  ],
  source: {
    entry: {
      index: ['src/index.tsx'],
    },
  },
  output: {
    target: 'node',
    format: 'esm',
    filename: {
      js: '[name].mjs',
    },
  },
});
