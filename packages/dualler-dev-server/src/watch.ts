import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';

export function createWatcher(
  root: string,
  onChange: (files: string[]) => void
): FSWatcher {
  const srcDir = path.join(root, 'src');
  const watcher = chokidar.watch(srcDir, {
    ignored: /node_modules/,
    ignoreInitial: true,
    persistent: true,
  });

  const changedFiles: string[] = [];
  let flushTimer: ReturnType<typeof setTimeout>;

  const flushChanges = () => {
    if (changedFiles.length > 0) {
      onChange([...changedFiles]);
      changedFiles.length = 0;
    }
  };

  watcher.on('change', (filePath: string) => {
    changedFiles.push(path.relative(root, filePath));
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushChanges, 100);
  });

  watcher.on('add', (filePath: string) => {
    changedFiles.push(path.relative(root, filePath));
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushChanges, 100);
  });

  watcher.on('unlink', (filePath: string) => {
    changedFiles.push(path.relative(root, filePath));
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushChanges, 100);
  });

  return watcher;
}
