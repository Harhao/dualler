import chokidar from 'chokidar';
import { compile } from '@dualler/compiler';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

interface DevServerOptions {
  port?: number;
}

export function devCommand(this: Parameters<typeof chokidar.watch> extends any ? any : any, options: DevServerOptions = {}) {
  const port = options.port || 3000;
  console.log(`Starting dev server on port ${port}...`);

  // 监听源码变化，实时编译
  const watcher = chokidar.watch(['src/**/*.vue', 'src/**/*.dualler'], {
    ignored: /node_modules/,
    persistent: true,
  });

  watcher.on('change', async (filepath: string) => {
    console.log(`Compiling ${filepath}...`);
    try {
      const source = readFileSync(filepath, 'utf-8');
      const result = compile({
        source,
        filename: filepath,
      });

      const outDir = resolve('dist', filepath);
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }
      writeFileSync(resolve(outDir, 'bundle.dsl.json'), JSON.stringify(result.dsl, null, 2));
      if (result.css) {
        writeFileSync(resolve(outDir, 'style.css'), result.css);
      }
      console.log(`Compiled ${filepath}`);
    } catch (err) {
      console.error(`Failed to compile ${filepath}:`, err);
    }
  });
}
