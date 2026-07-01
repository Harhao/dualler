#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { previewCommand } from './commands/preview';
import { CreateWizard } from './commands/create/index';

const program = new Command();

program
  .name('dualler')
  .description('类 Vue3 语法的小程序引擎命令行工具')
  .version('0.1.0');

// dualler create — 交互式项目创建向导（Ink UI）
program
  .command('create <name>')
  .description('创建新的 Dualler 小程序项目')
  .action((name: string) => {
    render(<CreateWizard projectName={name} />);
  });

// dualler build
program
  .command('build')
  .description('编译小程序项目')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .action(buildCommand);

// dualler dev
program
  .command('dev')
  .description('启动开发服务器')
  .option('-p, --port <number>', '端口号', '3000')
  .action(devCommand);

// dualler preview
program
  .command('preview')
  .description('本地预览编译产物')
  .option('-d, --dir <path>', '预览目录', 'dist')
  .action(previewCommand);

program.parse();
