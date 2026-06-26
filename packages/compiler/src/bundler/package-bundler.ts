import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative, resolve, extname } from 'path';
import { createHash } from 'crypto';
import { parseSFC, getScriptBlock } from '../parser/sfc-parser';
import { compileTemplate } from '../parser/template-compiler';
import { compileScript, CompileScriptOptions } from '../parser/script-compiler';
import { compileStyle } from '../parser/style-compiler';
import { compileAllWxs, transformWxsExpressions } from '../parser/wxs-compiler';
import { buildDependencyGraph, DependencyGraph } from './dependency-graph';
import { BundleError } from '../errors/compiler-error';

export interface BundleOptions {
  /** Mini-program appId */
  appId: string;
  /** Entry file path (app.vue) */
  entry: string;
  /** Page paths (relative to project root) */
  pages: string[];
  /** Component paths (relative to project root) */
  components: string[];
  /** Output directory */
  outputDir: string;
  /** Enable minification */
  minify?: boolean;
  /** Enable source maps */
  sourceMap?: boolean;
  /** Project root directory (for resolving imports) */
  projectRoot?: string;
  /** Source directory prefix to strip from output paths (e.g., "packages/example/src") */
  srcDir?: string;
  /** App configuration from app.json */
  appConfig?: Record<string, any>;
}

export interface BundleResult {
  /** Generated files with their info */
  files: Map<string, FileInfo>;
  /** Build manifest */
  manifest: Manifest;
  /** Dependency graph */
  dependencyGraph: DependencyGraph;
  /** Compilation warnings */
  warnings: string[];
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
  /** Maximum page stack depth */
  maxStackSize: number;
  /** Page route configuration */
  pageRoutes: Record<string, { path: string; style?: Record<string, any> }>;
  /** Component registration table */
  componentRegistry: Record<string, { path: string; props?: string[] }>;
}

const COMPILER_VERSION = '2.0.0';

/**
 * Auto-detect the source directory prefix from entry and page paths.
 * Looks for common patterns like "src/" or nested package src directories.
 */
function detectSrcDir(entry: string, pages: string[]): string | undefined {
  // Try to find common prefix
  const allPaths = [entry, ...pages.map(p => p + '.vue')];

  if (allPaths.length === 0) return undefined;

  // Find the longest common prefix that ends at a directory boundary
  let prefix = allPaths[0];
  for (const path of allPaths) {
    while (!path.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }

  // Ensure prefix ends at a directory boundary
  const lastSlash = prefix.lastIndexOf('/');
  if (lastSlash > 0) {
    prefix = prefix.slice(0, lastSlash);
  }

  // If the prefix ends with "src", include it
  if (prefix.endsWith('/src')) {
    return prefix;
  }

  // If the prefix ends with a package name followed by src
  const srcMatch = prefix.match(/^(.+\/src)$/);
  if (srcMatch) {
    return srcMatch[1];
  }

  return prefix || undefined;
}

/**
 * Normalize a path by stripping the srcDir prefix
 */
function normalizePath(path: string, srcDir?: string): string {
  if (!srcDir) return path;
  const normalized = path.replace(/\\/g, '/');
  const prefix = srcDir.replace(/\\/g, '/');
  if (normalized.startsWith(prefix + '/')) {
    return normalized.slice(prefix.length + 1);
  }
  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length);
  }
  return normalized;
}

/**
 * Bundle a Dualler mini-program
 *
 * Main pipeline:
 * 1. Read and parse app configuration
 * 2. Process app.vue (global styles, lifecycle hooks)
 * 3. Process each page (template + script + style → HTML + JS + CSS)
 * 4. Process each component
 * 5. Build dependency graph
 * 6. Generate manifest and output files
 */
export async function bundle(options: BundleOptions): Promise<BundleResult> {
  const {
    appId,
    entry,
    pages,
    components,
    outputDir,
    minify = true,
    sourceMap = false,
    projectRoot = dirname(entry),
    srcDir,
    appConfig = {},
  } = options;

  // Auto-detect srcDir if not provided
  // Convert entry to relative path for consistent comparison with pages
  const relativeEntry = relative(projectRoot, entry);
  const effectiveSrcDir = srcDir ?? detectSrcDir(relativeEntry, pages);

  const files = new Map<string, FileInfo>();
  const warnings: string[] = [];

  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  // Step 1: Process app.vue
  await processAppEntry(entry, appId, outputDir, files, warnings);

  // Step 2: Process pages
  for (const pagePath of pages) {
    const fullPath = resolve(projectRoot, pagePath + '.vue');
    if (!existsSync(fullPath)) {
      warnings.push(`Page not found: ${fullPath}`);
      continue;
    }
    const normalizedPath = normalizePath(pagePath, effectiveSrcDir);
    await processPage(fullPath, normalizedPath, outputDir, projectRoot, files, warnings);
  }

  // Step 3: Process components
  for (const compPath of components) {
    const fullPath = resolve(projectRoot, compPath + '.vue');
    if (!existsSync(fullPath)) {
      warnings.push(`Component not found: ${fullPath}`);
      continue;
    }
    const normalizedPath = normalizePath(compPath, effectiveSrcDir);
    await processComponent(fullPath, normalizedPath, outputDir, projectRoot, files, warnings);
  }

  // Step 4: Copy static assets
  copyStaticAssets(projectRoot, outputDir, files);

  // Step 5: Build dependency graph
  const allVueFiles = [
    resolve(projectRoot, entry),
    ...pages.map(p => resolve(projectRoot, p + '.vue')),
    ...components.map(c => resolve(projectRoot, c + '.vue')),
  ].filter(existsSync);
  const dependencyGraph = buildDependencyGraph(allVueFiles, projectRoot);

  // Step 6: Generate manifest
  const manifest: Manifest = {
    appId,
    version: appConfig.version ?? '1.0.0',
    compilerVersion: COMPILER_VERSION,
    pages: pages.map(p => normalizePath(p, effectiveSrcDir)),
    components: components.map(c => normalizePath(c, effectiveSrcDir)),
    files: Object.fromEntries(files),
    totalSize: Array.from(files.values()).reduce((sum, f) => sum + f.size, 0),
    buildTime: new Date().toISOString(),
    maxStackSize: appConfig.maxStackSize ?? 5,
    pageRoutes: buildPageRoutes(pages, appConfig, effectiveSrcDir),
    componentRegistry: buildComponentRegistry(components, projectRoot, effectiveSrcDir),
  };

  writeFileSync(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  files.set('manifest.json', createFileInfo('manifest.json', JSON.stringify(manifest)));

  return { files, manifest, dependencyGraph, warnings };
}

/**
 * Process app.vue — the application entry point
 *
 * Extracts global styles and generates app.js with lifecycle hooks.
 */
async function processAppEntry(
  entry: string,
  appId: string,
  outputDir: string,
  files: Map<string, FileInfo>,
  warnings: string[],
): Promise<void> {
  if (!existsSync(entry)) {
    // Generate minimal app.js if app.vue doesn't exist
    const appJs = `// Dualler App Entry\n// appId: ${appId}\nconsole.log('Dualler app loaded: ${appId}');`;
    const appJsPath = 'app.js';
    writeFileSync(join(outputDir, appJsPath), appJs);
    files.set(appJsPath, createFileInfo(appJsPath, appJs));
    return;
  }

  const source = readFileSync(entry, 'utf-8');
  const { descriptor, hasScriptSetup, componentName } = parseSFC(source, entry);

  // Generate app.js
  let appJs = '';

  if (descriptor.script || descriptor.scriptSetup) {
    const scriptBlock = getScriptBlock(descriptor)!;
    const scriptSource = scriptBlock.content;

    const result = compileScript(scriptSource, {
      filename: entry,
      isSetup: hasScriptSetup,
      componentName,
    });
    appJs = result.code;
  } else {
    appJs = `// Dualler App Entry\nconsole.log('App loaded: ${appId}');`;
  }

  // Prepend app header
  appJs = `// Dualler App Entry\n// appId: ${appId}\n// Generated by Dualler Compiler v${COMPILER_VERSION}\n\n${appJs}`;

  const appJsPath = 'app.js';
  writeFileSync(join(outputDir, appJsPath), appJs);
  files.set(appJsPath, createFileInfo(appJsPath, appJs));

  // Generate app.css from global styles
  if (descriptor.styles.length > 0) {
    let appCss = '';
    for (const style of descriptor.styles) {
      if (!style.scoped) {
        // Global styles go into app.css
        const compiled = await compileStyle(style.content, {
          scoped: false,
          filename: entry,
          basedir: dirname(entry),
          designWidth: 750,
        });
        appCss += compiled + '\n';
      }
    }
    if (appCss) {
      const appCssPath = 'app.css';
      writeFileSync(join(outputDir, appCssPath), appCss);
      files.set(appCssPath, createFileInfo(appCssPath, appCss));
    }
  }
}

/**
 * Process a page Vue file → generates page.html + page.js + page.css
 */
async function processPage(
  filePath: string,
  pagePath: string,
  outputDir: string,
  projectRoot: string,
  files: Map<string, FileInfo>,
  warnings: string[],
): Promise<void> {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor, hasScriptSetup, componentName } = parseSFC(source, filePath);

  // pagePath is already normalized by the caller
  const pageName = pagePath;
  const pageDir = dirname(join(outputDir, pageName));
  mkdirSync(pageDir, { recursive: true });

  // Compile template → HTML
  let templateHtml = '';
  let templateDeps: string[] = [];
  let nativeComponents: string[] = [];

  if (descriptor.template) {
    // Process WXS first
    let templateSource = descriptor.template.content;
    const wxsCode = compileAllWxs(templateSource);
    templateSource = transformWxsExpressions(templateSource);

    const templateResult = compileTemplate(templateSource, {
      filename: filePath,
    });

    templateHtml = templateResult.code;
    templateDeps = templateResult.deps;
    nativeComponents = templateResult.nativeComponents;

    // Inject WXS scripts into HTML
    if (wxsCode) {
      templateHtml = `<script>${wxsCode}</script>\n${templateHtml}`;
    }
  }

  // Compile script → JS
  let scriptJs = '';

  if (descriptor.script || descriptor.scriptSetup) {
    const scriptBlock = getScriptBlock(descriptor)!;
    const scriptSource = scriptBlock.content;

    const result = compileScript(scriptSource, {
      filename: filePath,
      isSetup: hasScriptSetup,
      componentName,
      wrapAsPage: true,
      templateReactiveDeps: templateDeps,
    });

    scriptJs = result.code;
  }

  // Compile style → CSS
  let styleCss = '';

  for (const style of descriptor.styles) {
    if (style.scoped) {
      // Generate a unique scope ID from file path
      const scopeId = generateScopeId(filePath);
      const compiled = await compileStyle(style.content, {
        scoped: true,
        id: scopeId,
        filename: filePath,
        basedir: dirname(filePath),
        designWidth: 750,
      });

      // Add scope attribute to opening tags only (not closing tags)
      templateHtml = templateHtml.replace(
        /(<[a-z][a-z0-9-]*\b[^>]*?)(\s*\/?>)/gi,
        (match, before, after) => {
          // Skip closing tags, already-scoped elements, and self-closing tags
          if (before.includes('data-v-') || match.includes('</')) return match;
          return `${before} data-v-${scopeId}${after}`;
        }
      );

      styleCss += compiled + '\n';
    } else {
      // Page-level non-scoped styles
      const compiled = await compileStyle(style.content, {
        scoped: false,
        filename: filePath,
        basedir: dirname(filePath),
        designWidth: 750,
      });
      styleCss += compiled + '\n';
    }
  }

  // Generate page.html
  const htmlContent = generatePageHtml(pageName, templateHtml);
  const htmlPath = `${pageName}.html`;
  writeFileSync(join(outputDir, htmlPath), htmlContent);
  files.set(htmlPath, createFileInfo(htmlPath, htmlContent));

  // Generate page.js
  const jsPath = `${pageName}.js`;
  writeFileSync(join(outputDir, jsPath), scriptJs);
  files.set(jsPath, createFileInfo(jsPath, scriptJs));

  // Generate page.css
  if (styleCss) {
    const cssPath = `${pageName}.css`;
    writeFileSync(join(outputDir, cssPath), styleCss);
    files.set(cssPath, createFileInfo(cssPath, styleCss));
  }
}

/**
 * Process a component Vue file → generates component HTML + JS + CSS
 */
async function processComponent(
  filePath: string,
  compPath: string,
  outputDir: string,
  projectRoot: string,
  files: Map<string, FileInfo>,
  warnings: string[],
): Promise<void> {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor, hasScriptSetup, componentName } = parseSFC(source, filePath);

  // compPath is already normalized by the caller
  const compName = compPath;
  const compDir = dirname(join(outputDir, compName));
  mkdirSync(compDir, { recursive: true });

  // Compile template → HTML fragment
  let templateHtml = '';
  let templateDeps: string[] = [];

  if (descriptor.template) {
    let templateSource = descriptor.template.content;
    templateSource = transformWxsExpressions(templateSource);

    const templateResult = compileTemplate(templateSource, {
      filename: filePath,
    });

    templateHtml = templateResult.code;
    templateDeps = templateResult.deps;
  }

  // Compile script → JS
  let scriptJs = '';

  if (descriptor.script || descriptor.scriptSetup) {
    const scriptBlock = getScriptBlock(descriptor)!;
    const scriptSource = scriptBlock.content;

    const result = compileScript(scriptSource, {
      filename: filePath,
      isSetup: hasScriptSetup,
      componentName,
      wrapAsComponent: true,
      templateReactiveDeps: templateDeps,
    });

    scriptJs = result.code;
  }

  // Compile style → CSS
  let styleCss = '';

  for (const style of descriptor.styles) {
    const scopeId = generateScopeId(filePath);
    const compiled = await compileStyle(style.content, {
      scoped: style.scoped,
      id: scopeId,
      filename: filePath,
      basedir: dirname(filePath),
      designWidth: 750,
    });

    if (style.scoped) {
      templateHtml = templateHtml.replace(
        /(<[^>]+?)(\s*\/?>)/g,
        (match, before, after) => {
          if (before.includes('data-v-') || after === '/>') return match;
          return `${before} data-v-${scopeId}${after}`;
        }
      );
    }

    styleCss += compiled + '\n';
  }

  // Write component files
  const htmlPath = `${compName}.html`;
  writeFileSync(join(outputDir, htmlPath), templateHtml);
  files.set(htmlPath, createFileInfo(htmlPath, templateHtml));

  const jsPath = `${compName}.js`;
  writeFileSync(join(outputDir, jsPath), scriptJs);
  files.set(jsPath, createFileInfo(jsPath, scriptJs));

  if (styleCss) {
    const cssPath = `${compName}.css`;
    writeFileSync(join(outputDir, cssPath), styleCss);
    files.set(cssPath, createFileInfo(cssPath, styleCss));
  }
}

/**
 * Generate page HTML wrapper
 *
 * The page.html loads:
 * 1. app.css (global styles)
 * 2. page.css (page-specific styles)
 * 3. Template content
 * 4. page.js (page logic)
 */
function generatePageHtml(pageName: string, templateHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="/app.css">
  <link rel="stylesheet" href="/${pageName}.css">
</head>
<body>
  <div id="app">
    ${templateHtml}
  </div>
  <script src="/${pageName}.js"></script>
</body>
</html>`;
}

/**
 * Copy static assets (images, fonts, etc.) to output directory
 */
function copyStaticAssets(
  projectRoot: string,
  outputDir: string,
  files: Map<string, FileInfo>,
): void {
  const assetDirs = ['assets', 'static', 'public'];

  for (const dir of assetDirs) {
    const assetDir = join(projectRoot, dir);
    if (!existsSync(assetDir)) continue;

    copyDir(assetDir, join(outputDir, dir), files, outputDir);
  }
}

function copyDir(
  src: string,
  dest: string,
  files: Map<string, FileInfo>,
  outputDir: string,
): void {
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, files, outputDir);
    } else {
      const content = readFileSync(srcPath);
      writeFileSync(destPath, content);
      const relativePath = relative(outputDir, destPath);
      files.set(relativePath, createFileInfo(relativePath, content.toString()));
    }
  }
}

/**
 * Build page routes for manifest
 */
function buildPageRoutes(
  pages: string[],
  appConfig: Record<string, any>,
  srcDir?: string,
): Record<string, { path: string; style?: Record<string, any> }> {
  const routes: Record<string, { path: string; style?: Record<string, any> }> = {};

  for (const page of pages) {
    const pageName = normalizePath(page, srcDir);
    routes[pageName] = {
      path: `${pageName}.html`,
    };
  }

  return routes;
}

/**
 * Build component registry for manifest
 */
function buildComponentRegistry(
  components: string[],
  projectRoot: string,
  srcDir?: string,
): Record<string, { path: string; props?: string[] }> {
  const registry: Record<string, { path: string; props?: string[] }> = {};

  for (const comp of components) {
    const compName = normalizePath(comp, srcDir);
    const fullPath = resolve(projectRoot, comp + '.vue');

    registry[compName] = {
      path: `${compName}.html`,
    };

    // Try to extract props from the component
    if (existsSync(fullPath)) {
      try {
        const source = readFileSync(fullPath, 'utf-8');
        const { descriptor } = parseSFC(source, fullPath);
        const scriptBlock = getScriptBlock(descriptor);
        if (scriptBlock) {
          // Simple props extraction from defineProps
          const propsMatch = scriptBlock.content.match(/defineProps\s*(?:<[^>]+>)?\s*\(\s*\{([^}]+)\}/s);
          if (propsMatch) {
            const propNames = propsMatch[1]
              .split(',')
              .map(p => p.trim().split(':')[0].trim())
              .filter(Boolean);
            if (propNames.length > 0) {
              registry[compName].props = propNames;
            }
          }
        }
      } catch {
        // Can't extract props, skip
      }
    }
  }

  return registry;
}

/**
 * Generate a deterministic scope ID from file path
 */
function generateScopeId(filePath: string): string {
  return createHash('md5').update(filePath).digest('hex').slice(0, 8);
}

function createFileInfo(path: string, content: string | Buffer): FileInfo {
  const sha256 = createHash('sha256').update(content).digest('hex');
  return { path, sha256, size: Buffer.byteLength(content) };
}
