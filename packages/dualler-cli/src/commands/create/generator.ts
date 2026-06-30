import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, Stats } from 'fs';
import { join, resolve } from 'path';

const TEMPLATES_DIR = join(__dirname, '../../../templates');

export function generateProject(projectName: string, template: string) {
  const projectDir = resolve(projectName);
  mkdirSync(projectDir, { recursive: true });

  // 复制模板文件
  const templateSrc = join(TEMPLATES_DIR, template);
  copyRecursive(templateSrc, projectDir);

  // 替换 package.json 中的项目名称
  const pkgPath = join(projectDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.name = projectName;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // 替换 dualler.config.ts 中的 appId
  const configPath = join(projectDir, 'dualler.config.ts');
  if (existsSync(configPath)) {
    let config = readFileSync(configPath, 'utf-8');
    config = config.replace(/appId:\s*['"][^'"]+['"]/, `appId: '${projectName}'`);
    writeFileSync(configPath, config);
  }
}

function copyRecursive(src: string, dest: string) {
  const stats: Stats = readFileSync(src);
  const isDir = stats.isDirectory();

  if (isDir) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
      copyRecursive(join(src, entry), join(dest, entry));
    }
  } else {
    copyFileSync(src, dest);
  }
}
