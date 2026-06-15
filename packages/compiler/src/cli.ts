#!/usr/bin/env node
import { resolve } from 'path';
import { bundle } from './bundler/package-bundler';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: dualler-compiler build [options]

Options:
  --appId        小程序 appId
  --entry        入口文件路径
  --pages        页面文件列表（逗号分隔）
  --components   组件文件列表（逗号分隔）
  --outputDir    输出目录（默认 ./dist）
  --minify       是否压缩（默认 true）
`);
    process.exit(0);
  }

  const command = args[0];
  if (command !== 'build') {
    console.error('Unknown command:', command);
    process.exit(1);
  }

  const options = parseArgs(args.slice(1));

  if (!options.appId || !options.pages) {
    console.error('Missing required options: --appId, --pages');
    process.exit(1);
  }

  console.log(`\n🔨 Dualler Compiler v1.0.0`);
  console.log(`   appId: ${options.appId}`);
  console.log(`   pages: ${options.pages}\n`);

  const result = await bundle({
    appId: options.appId,
    entry: options.entry || 'src/app.vue',
    pages: options.pages.split(',').map(p => p.trim()),
    components: options.components ? options.components.split(',').map(c => c.trim()) : [],
    outputDir: resolve(options.outputDir || './dist'),
    minify: options.minify !== 'false',
  });

  console.log('✅ Build succeeded!');
  console.log(`   files: ${result.files.size}`);
  console.log(`   total size: ${(result.manifest.totalSize / 1024).toFixed(1)}KB`);
}

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value) result[key] = value;
  }
  return result;
}

main().catch(console.error);
