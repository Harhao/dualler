#!/usr/bin/env node
import { resolve, join, dirname } from 'path';
import { readFileSync, existsSync, watchFile, unwatchFile } from 'fs';
import { bundle } from './bundler/package-bundler';
import { CompilerError } from './errors/compiler-error';

interface CLIOptions {
  appId?: string;
  entry?: string;
  pages?: string;
  components?: string;
  outputDir?: string;
  minify?: string;
  config?: string;
  watch?: boolean;
  verbose?: boolean;
  projectRoot?: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  if (args[0] === '--version' || args[0] === '-v') {
    console.log('@dualler/compiler v2.0.0');
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'build':
      await runBuild(args.slice(1));
      break;
    case 'watch':
      await runWatch(args.slice(1));
      break;
    case 'preview':
      await runPreview(args.slice(1));
      break;
    case 'inspect':
      await runInspect(args.slice(1));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "dualler-compiler --help" for usage information.');
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
@dualler/compiler - Vue3 Mini-Program Compiler

Usage:
  dualler-compiler <command> [options]

Commands:
  build     Compile the mini-program
  watch     Watch for changes and recompile
  inspect   Inspect a compiled output

Build Options:
  --appId        Mini-program appId (required)
  --entry        Entry file path (default: src/app.vue)
  --pages        Page file list, comma-separated (required if no config)
  --components   Component file list, comma-separated
  --outputDir    Output directory (default: ./dist)
  --minify       Enable minification (default: true)
  --config       Path to config file (dualler.config.json)
  --verbose      Enable verbose output

Watch Options:
  (same as build, plus:)
  --interval     Polling interval in ms (default: 300)

Examples:
  dualler-compiler build --appId com.example.app --pages src/pages/index/index,src/pages/detail/detail
  dualler-compiler watch --appId com.example.app --pages src/pages/index/index --outputDir ./dist
`);
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];

      if (key === 'watch' || key === 'verbose') {
        (options as any)[key] = true;
      } else if (value && !value.startsWith('--')) {
        (options as any)[key] = value;
        i++; // skip value
      }
    }
  }

  return options;
}

/**
 * Load configuration from dualler.config.json or app.json
 */
function loadConfig(options: CLIOptions, projectRoot: string): Record<string, any> {
  // Try explicit config file
  if (options.config) {
    const configPath = resolve(projectRoot, options.config);
    if (existsSync(configPath)) {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    }
  }

  // Try dualler.config.json
  const duallerConfig = join(projectRoot, 'dualler.config.json');
  if (existsSync(duallerConfig)) {
    return JSON.parse(readFileSync(duallerConfig, 'utf-8'));
  }

  // Try app.json
  const appJson = join(projectRoot, 'app.json');
  if (existsSync(appJson)) {
    return JSON.parse(readFileSync(appJson, 'utf-8'));
  }

  return {};
}

function resolveOptions(options: CLIOptions, projectRoot: string): {
  appId: string;
  entry: string;
  pages: string[];
  components: string[];
  outputDir: string;
  minify: boolean;
  srcDir?: string;
} {
  const config = loadConfig(options, projectRoot);

  const appId = options.appId ?? config.appId;
  if (!appId) {
    console.error('Error: --appId is required (or set appId in config)');
    process.exit(1);
  }

  // Try to find the entry file
  const entryPath = options.entry ?? config.entry ?? 'src/app.vue';
  const entry = resolve(projectRoot, entryPath);

  // Detect if we need src/ prefix
  let srcDir: string | undefined;

  if (existsSync(entry)) {
    // Entry found - check if it's under src/
    const relativeEntry = entry.replace(projectRoot, '').replace(/^\//, '');
    if (relativeEntry.startsWith('src/')) {
      srcDir = 'src';
    }
  } else {
    // Entry not found - try with src/ prefix
    const altEntry = resolve(projectRoot, 'src', entryPath);
    if (existsSync(altEntry)) {
      srcDir = 'src';
    }
  }

  // Resolve pages and components with srcDir if detected
  const pages = resolvePagePaths(options, config, projectRoot, srcDir);
  const components = resolveComponentPaths(options, config, projectRoot, srcDir);
  const outputDir = resolve(projectRoot, options.outputDir ?? config.outputDir ?? './dist');
  const minify = options.minify !== 'false';

  // Resolve entry with srcDir
  const finalEntry = srcDir && !existsSync(entry)
    ? resolve(projectRoot, srcDir, entryPath)
    : entry;

  return { appId, entry: finalEntry, pages, components, outputDir, minify, srcDir };
}

function resolvePagePaths(options: CLIOptions, config: Record<string, any>, projectRoot: string, srcDir?: string): string[] {
  if (options.pages) {
    return options.pages.split(',').map(p => p.trim());
  }

  if (config.pages) {
    return config.pages.map((page: string) => {
      // Try with srcDir prefix first if available
      if (srcDir) {
        const withSrc = `${srcDir}/${page}`;
        const fullPath = resolve(projectRoot, withSrc + '.vue');
        if (existsSync(fullPath)) return withSrc;
      }
      // Try direct path
      const directPath = resolve(projectRoot, page + '.vue');
      if (existsSync(directPath)) return page;
      // Return as-is (will generate warning later)
      return page;
    });
  }

  console.error('Error: --pages is required (or set pages in config)');
  process.exit(1);
}

function resolveComponentPaths(options: CLIOptions, config: Record<string, any>, projectRoot: string, srcDir?: string): string[] {
  if (options.components) {
    return options.components.split(',').map(c => c.trim());
  }

  if (config.components) {
    return config.components.map((comp: string) => {
      if (srcDir) {
        const withSrc = `${srcDir}/${comp}`;
        const fullPath = resolve(projectRoot, withSrc + '.vue');
        if (existsSync(fullPath)) return withSrc;
      }
      return comp;
    });
  }

  return [];
}

async function runBuild(args: string[]) {
  const options = parseArgs(args);
  const projectRoot = (options as any).projectRoot
    ? resolve(process.cwd(), (options as any).projectRoot)
    : process.cwd();
  const resolved = resolveOptions(options, projectRoot);

  console.log(`\n🔨 Dualler Compiler v2.0.0`);
  console.log(`   appId: ${resolved.appId}`);
  console.log(`   pages: ${resolved.pages.length}`);
  console.log(`   components: ${resolved.components.length}`);
  console.log(`   output: ${resolved.outputDir}\n`);

  const startTime = Date.now();

  try {
    const result = await bundle({
      ...resolved,
      projectRoot,
      appConfig: loadConfig(options, projectRoot),
    });

    const elapsed = Date.now() - startTime;

    console.log('✅ Build succeeded!');
    console.log(`   files: ${result.files.size}`);
    console.log(`   total size: ${(result.manifest.totalSize / 1024).toFixed(1)}KB`);
    console.log(`   time: ${elapsed}ms`);

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      for (const warning of result.warnings) {
        console.log(`   - ${warning}`);
      }
    }
  } catch (err) {
    if (err instanceof CompilerError) {
      console.error(`\n❌ ${err.toString()}`);
    } else {
      console.error('\n❌ Build failed:', err);
    }
    process.exit(1);
  }
}

async function runWatch(args: string[]) {
  const options = { ...parseArgs(args), watch: true };
  const projectRoot = process.cwd();
  const resolved = resolveOptions(options, projectRoot);

  console.log(`\n👀 Dualler Compiler v2.0.0 - Watch Mode`);
  console.log(`   appId: ${resolved.appId}`);
  console.log(`   pages: ${resolved.pages.length}`);
  console.log(`   output: ${resolved.outputDir}\n`);

  // Initial build
  await doBuild(resolved, projectRoot, options);

  // Watch for changes
  const watchInterval = parseInt(options.watch as any) || 300;

  // Collect all files to watch
  const filesToWatch = [
    resolved.entry,
    ...resolved.pages.map(p => resolve(projectRoot, p + '.vue')),
    ...resolved.components.map(c => resolve(projectRoot, c + '.vue')),
  ].filter(existsSync);

  console.log(`\n⏳ Watching ${filesToWatch.length} files (polling every ${watchInterval}ms)...`);
  console.log('   Press Ctrl+C to stop.\n');

  for (const file of filesToWatch) {
    watchFile(file, { interval: watchInterval }, async () => {
      console.log(`\n🔄 File changed: ${file}`);
      await doBuild(resolved, projectRoot, options);
    });
  }
}

async function doBuild(
  resolved: ReturnType<typeof resolveOptions>,
  projectRoot: string,
  options: CLIOptions,
) {
  try {
    const result = await bundle({
      ...resolved,
      projectRoot,
      appConfig: loadConfig(options, projectRoot),
    });

    const now = new Date().toLocaleTimeString();
    console.log(`[${now}] ✅ Build succeeded - ${result.files.size} files, ${(result.manifest.totalSize / 1024).toFixed(1)}KB`);

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.log(`  ⚠️  ${warning}`);
      }
    }
  } catch (err) {
    if (err instanceof CompilerError) {
      console.error(`❌ ${err.toString()}`);
    } else {
      console.error('❌ Build failed:', err);
    }
    // Don't exit in watch mode
  }
}

async function runPreview(args: string[]) {
  const options = parseArgs(args);
  const projectRoot = (options as any).projectRoot
    ? resolve(process.cwd(), (options as any).projectRoot)
    : process.cwd();

  const outputDir = resolve(projectRoot, (options as any).outputDir ?? './dist');
  const port = parseInt((options as any).port ?? '8080');

  if (!existsSync(outputDir)) {
    console.error(`Error: output directory not found: ${outputDir}`);
    console.error('Run "dualler-compiler build" first to generate the output.');
    process.exit(1);
  }

  try {
    const { DevServer } = require('./server/dev-server');
    const server = new DevServer({
      root: outputDir,
      port,
      cors: true,
    });

    await server.start();

    console.log('Press Ctrl+C to stop the server.\n');

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n\nStopping server...');
      await server.stop();
      process.exit(0);
    });
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${port} is already in use. Try --port <number>`);
    } else {
      console.error('Error starting server:', err.message);
    }
    process.exit(1);
  }
}

async function runInspect(args: string[]) {
  const options = parseArgs(args);
  const file = args.find(a => !a.startsWith('--'));

  if (!file) {
    console.error('Error: specify a file to inspect');
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const source = readFileSync(filePath, 'utf-8');
  const { parseSFC } = require('./parser/sfc-parser');
  const { compileTemplate } = require('./parser/template-compiler');
  const { compileScript } = require('./parser/script-compiler');

  console.log(`\n📄 Inspecting: ${file}\n`);

  try {
    const { descriptor, langInfo, hasScriptSetup, componentName } = parseSFC(source, filePath);

    console.log('SFC Info:');
    console.log(`  Component: ${componentName}`);
    console.log(`  Script setup: ${hasScriptSetup}`);
    console.log(`  Languages: template=${langInfo.templateLang}, script=${langInfo.scriptLang}, style=${langInfo.styleLang}`);
    console.log(`  Styles: ${descriptor.styles.length} (${descriptor.styles.filter((s: any) => s.scoped).length} scoped)`);

    if (descriptor.template) {
      console.log('\nTemplate:');
      console.log(`  Source length: ${descriptor.template.content.length} chars`);

      const result = compileTemplate(descriptor.template.content, { filename: filePath });
      console.log(`  Reactive deps: ${result.deps.join(', ') || '(none)'}`);
      console.log(`  Native components: ${result.nativeComponents.join(', ') || '(none)'}`);
      console.log(`  Custom components: ${result.customComponentTags.join(', ') || '(none)'}`);
    }

    if (descriptor.script || descriptor.scriptSetup) {
      console.log('\nScript:');
      const result = compileScript(descriptor.scriptSetup?.content ?? descriptor.script!.content, {
        filename: filePath,
        isSetup: hasScriptSetup,
      });
      console.log(`  Imports: ${Array.from(result.imports.keys()).join(', ') || '(none)'}`);
      console.log(`  Reactive vars: ${result.reactiveVars.join(', ') || '(none)'}`);
      console.log(`  Lifecycle hooks: ${result.lifecycleHooks.join(', ') || '(none)'}`);
    }

    console.log('\n✅ Inspection complete');
  } catch (err) {
    if (err instanceof CompilerError) {
      console.error(`\n❌ ${err.toString()}`);
    } else {
      console.error('\n❌ Inspection failed:', err);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
