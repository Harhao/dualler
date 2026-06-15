import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';

export interface BundleOptions {
  appId: string;
  entry: string;
  pages: string[];
  components: string[];
  outputDir: string;
  minify?: boolean;
  sourceMap?: boolean;
}

export interface BundleResult {
  files: Map<string, FileInfo>;
  manifest: Manifest;
}

export interface FileInfo {
  path: string;
  sha256: string;
  size: number;
}

export interface Manifest {
  appId: string;
  version: string;
  compilerVersion: string;
  pages: string[];
  components: string[];
  files: Record<string, FileInfo>;
  totalSize: number;
  buildTime: string;
}

const COMPILER_VERSION = '1.0.0';

export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const { appId, entry, pages, components, outputDir, minify = true, sourceMap = false } = options;
  const files = new Map<string, FileInfo>();

  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  // Build app.js
  const appJsContent = `// Dualler App Entry\n// appId: ${appId}\nconsole.log('Dualler app loaded');`;
  const appJsPath = 'app.js';
  writeFileSync(join(outputDir, appJsPath), appJsContent);
  files.set(appJsPath, createFileInfo(appJsPath, appJsContent));

  // Build pages
  for (const page of pages) {
    // Normalize path: remove .vue, extract relative path from src/
    const normalized = page.replace(/\\/g, '/');  // normalize slashes
    const match = normalized.match(/src\/(.+)\.vue$/);
    const pageName = match ? match[1] : normalized.replace(/\.vue$/, '').replace(/^.*\//, '');

    const jsContent = `// Page: ${pageName}\n__dualler_page__('${pageName}', { setup() { return {}; } });`;
    const htmlContent = `<!DOCTYPE html><html><body><div id="app"></div></body></html>`;
    const cssContent = `/* Page: ${pageName} */\nbody { margin: 0; }`;

    const jsPath = `${pageName}.js`;
    const htmlPath = `${pageName}.html`;
    const cssPath = `${pageName}.css`;

    // Ensure subdirectory exists
    const jsDir = dirname(join(outputDir, jsPath));
    mkdirSync(jsDir, { recursive: true });

    writeFileSync(join(outputDir, jsPath), jsContent);
    writeFileSync(join(outputDir, htmlPath), htmlContent);
    writeFileSync(join(outputDir, cssPath), cssContent);

    files.set(jsPath, createFileInfo(jsPath, jsContent));
    files.set(htmlPath, createFileInfo(htmlPath, htmlContent));
    files.set(cssPath, createFileInfo(cssPath, cssContent));
  }

  // Generate manifest
  const manifest: Manifest = {
    appId,
    version: '1.0.0',
    compilerVersion: COMPILER_VERSION,
    pages: pages.map(p => p.replace(/\.vue$/, '').replace(/^src\//, '')),
    components: components.map(c => c.replace(/\.vue$/, '').replace(/^src\//, '')),
    files: Object.fromEntries(files),
    totalSize: Array.from(files.values()).reduce((sum, f) => sum + f.size, 0),
    buildTime: new Date().toISOString(),
  };

  writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  return { files, manifest };
}

function createFileInfo(path: string, content: string): FileInfo {
  const sha256 = createHash('sha256').update(content).digest('hex');
  return { path, sha256, size: Buffer.byteLength(content) };
}
