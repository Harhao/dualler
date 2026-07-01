export interface StatResult {
  isDir: boolean;
  size: number;
}

export interface ReaddirResult {
  files: string[];
}

export interface FileSystemManager {
  readFileSync(path: string, encoding?: 'utf8' | 'ascii' | 'base64'): string;
  writeFileSync(path: string, data: string | Uint8Array, encoding?: string): void;
  statSync(path: string): StatResult;
  mkdirSync(dirPath: string): void;
  readdirSync(dirPath: string): ReaddirResult;
  unlinkSync(path: string): void;
  readFile(options: { path: string; encoding?: string; success?: (res: { data: string }) => void; fail?: (err: any) => void; complete?: () => void }): void;
  writeFile(options: { path: string; data: string; encoding?: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void;
  mkdir(options: { dirPath: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void;
  readdir(options: { dirPath: string; success?: (res: ReaddirResult) => void; fail?: (err: any) => void; complete?: () => void }): void;
  unlink(options: { path: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void;
  stats(options: { path: string; success?: (res: StatResult) => void; fail?: (err: any) => void; complete?: () => void }): void;
}

const DEFAULT_STAT: StatResult = { isDir: false, size: 0 };

export function getFileSystemManager(): FileSystemManager {
  return {
    readFileSync(path: string, _encoding?: string): string {
      console.log(`[fs] readFileSync: ${path}`);
      return '';
    },
    writeFileSync(path: string, _data: string | Uint8Array, _encoding?: string): void {
      console.log(`[fs] writeFileSync: ${path}`);
    },
    statSync(path: string): StatResult {
      console.log(`[fs] statSync: ${path}`);
      return { ...DEFAULT_STAT };
    },
    mkdirSync(dirPath: string): void {
      console.log(`[fs] mkdirSync: ${dirPath}`);
    },
    readdirSync(dirPath: string): ReaddirResult {
      console.log(`[fs] readdirSync: ${dirPath}`);
      return { files: [] };
    },
    unlinkSync(path: string): void {
      console.log(`[fs] unlinkSync: ${path}`);
    },
    readFile(options: { path: string; encoding?: string; success?: (res: { data: string }) => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] readFile: ${options.path}`);
      options.success?.({ data: '' });
      options.complete?.();
    },
    writeFile(options: { path: string; data: string; encoding?: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] writeFile: ${options.path}`);
      options.success?.();
      options.complete?.();
    },
    mkdir(options: { dirPath: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] mkdir: ${options.dirPath}`);
      options.success?.();
      options.complete?.();
    },
    readdir(options: { dirPath: string; success?: (res: ReaddirResult) => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] readdir: ${options.dirPath}`);
      options.success?.({ files: [] });
      options.complete?.();
    },
    unlink(options: { path: string; success?: () => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] unlink: ${options.path}`);
      options.success?.();
      options.complete?.();
    },
    stats(options: { path: string; success?: (res: StatResult) => void; fail?: (err: any) => void; complete?: () => void }): void {
      console.log(`[fs] stats: ${options.path}`);
      options.success?.({ ...DEFAULT_STAT });
      options.complete?.();
    },
  };
}
