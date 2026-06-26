import { watch, FSWatcher } from 'fs';
import { resolve, relative } from 'path';
import { existsSync, statSync } from 'fs';

export interface WatchOptions {
  /** Polling interval in ms (default: 300) */
  interval?: number;
  /** Files/directories to watch */
  paths: string[];
  /** Callback when files change */
  onChange: (changedFiles: string[]) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * File watcher for incremental compilation
 *
 * Uses Node.js fs.watch with polling fallback for reliability.
 * Debounces rapid changes to avoid excessive recompilation.
 */
export class FileWatcher {
  private watchers: FSWatcher[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingChanges = new Set<string>();
  private options: Required<WatchOptions>;

  constructor(options: WatchOptions) {
    this.options = {
      interval: 300,
      onError: (err) => console.error('Watcher error:', err),
      ...options,
    };
  }

  /**
   * Start watching files
   */
  start(): void {
    for (const watchPath of this.options.paths) {
      if (!existsSync(watchPath)) {
        continue;
      }

      try {
        const stat = statSync(watchPath);
        const watcher = watch(
          watchPath,
          { recursive: stat.isDirectory() },
          (eventType, filename) => {
            if (filename) {
              const fullPath = stat.isDirectory()
                ? resolve(watchPath, filename)
                : watchPath;
              this.handleChange(fullPath);
            }
          }
        );

        watcher.on('error', (err) => {
          this.options.onError(err);
        });

        this.watchers.push(watcher);
      } catch (err) {
        this.options.onError(err as Error);
      }
    }
  }

  /**
   * Stop watching all files
   */
  stop(): void {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Handle a file change with debouncing
   */
  private handleChange(filePath: string): void {
    this.pendingChanges.add(filePath);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const changes = Array.from(this.pendingChanges);
      this.pendingChanges.clear();
      this.debounceTimer = null;

      if (changes.length > 0) {
        this.options.onChange(changes);
      }
    }, this.options.interval);
  }
}

/**
 * Create a file watcher for a mini-program project
 */
export function createProjectWatcher(
  projectRoot: string,
  files: string[],
  onChange: (changedFiles: string[]) => void,
): FileWatcher {
  return new FileWatcher({
    paths: files.map(f => resolve(projectRoot, f)),
    interval: 300,
    onChange,
    onError: (err) => {
      console.error('⚠️  Watch error:', err.message);
    },
  });
}
