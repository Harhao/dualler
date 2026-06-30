import { Command } from 'commander';
import { compile } from '@dualler/compiler';
import { resolve } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';

export function buildCommand(this: Parameters<Command['action']>[0]) {
  const options = this.opts();
  const output = resolve(options.output);

  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }

  // 扫描 pages.json 获取页面列表
  const pagesConfig = JSON.parse(
    require('fs').readFileSync(resolve('pages.json'), 'utf-8')
  );

  for (const page of pagesConfig.pages) {
    const srcPath = resolve(page.src);
    const result = compile({
      source: require('fs').readFileSync(srcPath, 'utf-8'),
      filename: page.src,
    });

    const outDir = resolve(output, page.page);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    // 输出 DSL bundle
    writeFileSync(resolve(outDir, 'bundle.dsl.json'), JSON.stringify(result.dsl, null, 2));
    // 输出样式
    if (result.css) {
      writeFileSync(resolve(outDir, 'style.css'), result.css);
    }
  }

  console.log(`Build complete: ${output}`);
}
