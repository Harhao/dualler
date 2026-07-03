import { compileToBundle } from '@dualler/compiler';
import fs from 'fs';
import path from 'path';

/**
 * Parse dualler.config.ts as text, extracting the default export value.
 */
function loadConfig(root: string): any {
  const configPath = path.join(root, 'dualler.config.ts');
  if (!fs.existsSync(configPath)) return null;

  const content = fs.readFileSync(configPath, 'utf-8');
  const match = content.match(/export\s+default\s+(\{[\s\S]*\})/);
  if (!match) return null;

  let objStr = match[1];
  objStr = objStr.replace(/;\s*$/, '').replace(/,\s*([}\]])/g, '$1');
  // eslint-disable-next-line no-eval
  return eval(`(${objStr})`);
}

export async function compileAndUpdate(
  root: string,
  onCompiled: (path: string) => void
) {
  const config = loadConfig(root);
  if (!config) return;

  const pages = config.pages || [];

  for (const page of pages) {
    const pagePath = typeof page === 'string' ? page : page.path;
    const basePath = pagePath.replace(/^\//, '');
    const vuePath = path.join(root, 'src', `${basePath}.vue`);

    if (!fs.existsSync(vuePath)) continue;

    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    try {
      const bundleJs = compileToBundle(vueSource, {
        source: vueSource,
        filename: path.basename(vuePath),
      });

      const distPath = path.join(root, 'dist', `${basePath}.bundle.js`);
      fs.mkdirSync(path.dirname(distPath), { recursive: true });
      fs.writeFileSync(distPath, bundleJs);

      onCompiled(`${basePath}.bundle.js`);
      console.log(`[dev-server] Compiled ${vuePath}`);
    } catch (err) {
      console.error(`[dev-server] Failed to compile ${vuePath}:`, err);
    }
  }
}
