import { resolve } from 'path';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';

export function previewCommand(this: any, options: { dir?: string } = {}) {
  const distDir = resolve(options.dir || 'dist');

  if (!existsSync(distDir)) {
    console.error('Dist directory not found. Please run `dualler build` first.');
    return;
  }

  console.log(`Previewing from: ${distDir}`);
  console.log('Open this path in a mini-program capable viewer to preview.');
  console.log(JSON.parse(readFileSync(resolve(distDir, 'app.dsl.json') || resolve(distDir, 'bundle.dsl.json'), 'utf-8')));
}
