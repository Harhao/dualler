import type { Compiler } from '@rspack/core';
import { duallerRspackCompiler } from './compiler';

export class DuallerRspackPlugin {
  private options: { root?: string };

  constructor(options: { root?: string } = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    duallerRspackCompiler(compiler, this.options);
  }
}
