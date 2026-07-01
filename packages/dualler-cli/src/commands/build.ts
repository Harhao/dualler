import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Command } from 'commander';
import { compile } from '@dualler/compiler';

export function buildCommand(this: any) {
  const options: any = this.opts();
  const output = resolve(options.output || 'dist');

  const pagesJsonPath = resolve('src/pages.json');
  if (!existsSync(pagesJsonPath)) {
    console.error('pages.json not found');
    return;
  }

  const pagesConfig = JSON.parse(readFileSync(pagesJsonPath, 'utf-8'));

  for (const page of pagesConfig.pages || []) {
    const srcPath = resolve('src', `${page.path}.vue`);
    if (!existsSync(srcPath)) continue;

    const source = readFileSync(srcPath, 'utf-8');
    const result = compile(source, {
      source,
      filename: page.path,
    });

    const outDir = resolve(output, page.path);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    writeFileSync(resolve(outDir, 'bundle.dsl.json'), JSON.stringify(result.dsl, null, 2));
    if (result.css) {
      writeFileSync(resolve(outDir, 'style.css'), result.css);
    }
  }

  console.log(`Build complete: ${output}`);
}
