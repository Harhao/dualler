import { compile } from '@dualler/compiler';
import fs from 'fs';
import path from 'path';

export async function compileAndUpdate(
  root: string,
  onPatches: (patches: any[]) => void
) {
  const pagesJsonPath = path.join(root, 'src/pages.json');
  if (!fs.existsSync(pagesJsonPath)) {
    return;
  }

  let pagesConfig: { pages?: { path: string; style?: Record<string, unknown> }[] };
  try {
    pagesConfig = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf-8'));
  } catch {
    console.error('[dev-server] Failed to parse pages.json');
    return;
  }

  for (const page of pagesConfig.pages || []) {
    const basePath = page.path.replace(/^\//, '');
    const vuePath = path.join(root, 'src', `${basePath}.vue`);

    // Try path-based lookup: src/pages/index -> src/pages/index.vue
    if (!fs.existsSync(vuePath)) {
      const altPath = path.join(root, 'src', 'pages', `${basePath.split('/').slice(-1)[0]}.vue`);
      if (fs.existsSync(altPath)) {
        // Skip non-matching pages; continue
      }
      continue;
    }

    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    try {
      const result = compile(vueSource, {
        source: vueSource,
        filename: path.basename(vuePath),
      });

      const distPath = path.join(root, 'dist', `${basePath}.bundle.js`);
      fs.mkdirSync(path.dirname(distPath), { recursive: true });
      fs.writeFileSync(distPath, JSON.stringify(result, null, 2));

      onPatches([]);
      console.log(`[dev-server] Compiled ${vuePath}`);
    } catch (err) {
      console.error(`[dev-server] Failed to compile ${vuePath}:`, err);
    }
  }
}
