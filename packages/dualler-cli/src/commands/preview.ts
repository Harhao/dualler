import { resolve } from 'path';
import * as fs from 'fs';

export function previewCommand(this: any, options: { dir?: string } = {}) {
  const distDir = resolve(options.dir || 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('Dist directory not found. Please run `dualler build` first.');
    return;
  }

  console.log(`Previewing from: ${distDir}`);
  console.log('Open this path in a mini-program capable viewer to preview.');
}
