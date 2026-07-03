import { Compilation, type Compiler } from '@rspack/core';
import { compileToBundle } from '@dualler/compiler';
import fs from 'fs';
import path from 'path';

export function duallerRspackCompiler(
  compiler: Compiler,
  options: { root?: string }
): void {
  const root = options.root || compiler.options.context || process.cwd();

  compiler.hooks.thisCompilation.tap(
    'DuallerRspackPlugin',
    (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'DuallerRspackPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const srcDir = path.join(root, 'src');
          if (!fs.existsSync(srcDir)) return;

          const vueFiles = findAllVueFiles(srcDir);
          for (const vueFile of vueFiles) {
            const source = fs.readFileSync(vueFile, 'utf-8');
            try {
              const bundleJs = compileToBundle(source, {
                source,
                filename: vueFile,
              });
              const assetName = path.relative(root, vueFile) + '.bundle.js';
              const { sources } = compiler.webpack || {};
              const RawSource = (sources?.RawSource as any)
                || class RawSource {
                    readonly _value: string;
                    constructor(v: string) { this._value = v; }
                    source() { return this._value; }
                    buffer() { return Buffer.from(this._value); }
                  };
              compilation.emitAsset(assetName, new RawSource(bundleJs));
            } catch (err) {
              compilation.errors.push(
                new Error(`[dualler] Failed to compile ${vueFile}: ${err}`)
              );
            }
          }
        }
      );
    }
  );
}

function findAllVueFiles(dir: string): string[] {
  let results: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findAllVueFiles(fullPath));
    } else if (item.name.endsWith('.vue')) {
      results.push(fullPath);
    }
  }
  return results;
}
