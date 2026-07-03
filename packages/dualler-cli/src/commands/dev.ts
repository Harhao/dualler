import chokidar from 'chokidar';
import { compileToBundle } from '@dualler/compiler';
import { resolve, basename } from 'path';
import * as fs from 'fs';

interface DevServerOptions {
  port?: number;
}

function resolvePageName(pagePath: string): string {
  return basename(pagePath);
}

export function devCommand(this: any, options: DevServerOptions = {}) {
  const port = options.port || 3000;
  console.log(`Starting dev server on port ${port}...`);

  // Load config to get page list
  const configPath = resolve(process.cwd(), 'dualler.config.ts');
  if (!fs.existsSync(configPath)) {
    console.error('dualler.config.ts not found');
    return;
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  const match = content.match(/export\s+default\s+(\{[\s\S]*\})/);
  if (!match) {
    console.error('Invalid dualler.config.ts');
    return;
  }
  // eslint-disable-next-line no-eval
  const config = eval(`(${match[1].replace(/;\s*$/, '').replace(/,\s*([}\]])/g, '$1')})`);
  const pages = config.pages || [];

  // Watch only the defined page paths
  const watchedPaths = pages.map((page: any) => {
    const pagePath = typeof page === 'string' ? page : page.path;
    return resolve('src', `${pagePath}.vue`);
  });

  const watcher = chokidar.watch(watchedPaths, { ignored: /node_modules/, persistent: true });

  watcher.on('change', (filepath: string) => {
    console.log(`Compiling ${filepath}...`);
    try {
      const source = fs.readFileSync(filepath, 'utf-8');
      const bundleJs = compileToBundle(source, {
        source,
        filename: filepath,
      });

      // Derive pagePath from filepath: src/pages/index.vue → pages/index
      const relPath = filepath.replace(resolve(process.cwd(), 'src') + '/', '').replace('.vue', '');
      const pageName = resolvePageName(relPath);
      const outDir = resolve('dist', relPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(resolve(outDir, `${pageName}.js`), bundleJs);

      // Extract and write CSS
      const cssMatch = bundleJs.match(/style\.textContent = "([^"]+)"/);
      if (cssMatch) {
        fs.writeFileSync(resolve(outDir, `${pageName}.css`), cssMatch[1]);
      }

      console.log(`Compiled ${filepath} → ${outDir}/${pageName}.js`);
    } catch (err) {
      console.error(`Failed to compile ${filepath}:`, err);
    }
  });
}
