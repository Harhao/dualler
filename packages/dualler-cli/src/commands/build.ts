import fs from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { Command } from 'commander';
import { compileToBundle } from '@dualler/compiler';

/**
 * Parse dualler.config.ts as text, extracting the default export value.
 * Strips TypeScript syntax (export default, type annotations) and evaluates as JSON-like object.
 */
function loadConfig(cwd: string): any {
  const configPath = resolve(cwd, 'dualler.config.ts');
  if (!fs.existsSync(configPath)) {
    console.error('dualler.config.ts not found');
    process.exit(1);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  // Extract the object after 'export default'
  const match = content.match(/export\s+default\s+(\{[\s\S]*\})/);
  if (!match) {
    console.error('Invalid dualler.config.ts: could not find export default');
    process.exit(1);
  }

  let objStr = match[1];
  // Strip trailing semicolons
  objStr = objStr.replace(/;\s*$/, '');
  // Strip trailing commas before } (not JSON compliant)
  objStr = objStr.replace(/,\s*([}\]])/g, '$1');
  // Wrap in parentheses and eval as JS object
  // eslint-disable-next-line no-eval
  return eval(`(${objStr})`);
}

/**
 * Derive the page name from a route path.
 *   pages/index/index → "index"
 *   pages/detail/detail → "detail"
 */
function resolvePageName(pagePath: string): string {
  return basename(pagePath);
}

export function buildCommand(this: any) {
  const options: any = this.opts();
  const cwd = process.cwd();
  const output = resolve(cwd, options.output || 'dist');
  const config = loadConfig(cwd);

  const pages = config.pages || [];
  if (pages.length === 0) {
    console.error('No pages defined in dualler.config.ts');
    return;
  }

  // Collect global styles from all pages
  const allGlobalCssParts: string[] = [];
  const allJsParts: string[] = [];

  for (const page of pages) {
    const pagePath = typeof page === 'string' ? page : page.path;
    const pageName = resolvePageName(pagePath);
    const vuePath = resolve(cwd, 'src', `${pagePath}.vue`);
    if (!fs.existsSync(vuePath)) continue;

    const source = fs.readFileSync(vuePath, 'utf-8');
    const bundleJs = compileToBundle(source, {
      source,
      filename: pagePath,
    });

    // Extract CSS from bundle
    const cssMatch = bundleJs.match(/style\.textContent = "([^"]+)"/);
    const pageCss = cssMatch ? cssMatch[1] : '';

    // Collect global assets for app.js/app.css
    if (pageCss) {
      allGlobalCssParts.push(pageCss);
    }
    allJsParts.push(bundleJs);

    // Output per-page files: dist/{pagePath}/{pageName}.js + {pageName}.css
    const outDir = resolve(output, pagePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(resolve(outDir, `${pageName}.js`), bundleJs);
    if (pageCss) {
      fs.writeFileSync(resolve(outDir, `${pageName}.css`), pageCss);
    }
  }

  // Output app.js / app.css at dist root
  const appCss = allGlobalCssParts.join('\n');
  if (appCss) {
    fs.writeFileSync(resolve(output, 'app.css'), appCss);
  } else {
    fs.writeFileSync(resolve(output, 'app.css'), '');
  }
  fs.writeFileSync(resolve(output, 'app.js'), '');

  console.log(`Build complete: ${output}`);
  console.log(`  Pages: ${pages.length}`);
  console.log(`  Output: ${output}/`);
}
