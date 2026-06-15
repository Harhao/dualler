/**
 * Memory File Provider
 *
 * 基于内存的文件提供者（Web 平台没有真实文件系统）
 */

import type { FileProvider } from '../types/platform';
import type { FileInfo } from '../types/models';

export class MemoryFileProvider implements FileProvider {
  private files: Map<string, string> = new Map();

  readFile(path: string, encoding: string = 'utf8'): string | null {
    return this.files.get(path) || null;
  }

  readFileBytes(path: string): Uint8Array | null {
    const content = this.files.get(path);
    if (!content) return null;
    return new TextEncoder().encode(content);
  }

  writeFile(path: string, data: string, encoding: string = 'utf8'): boolean {
    try {
      this.files.set(path, data);
      return true;
    } catch (error) {
      console.error('File write error:', error);
      return false;
    }
  }

  writeFileBytes(path: string, data: Uint8Array): boolean {
    try {
      const content = new TextDecoder().decode(data);
      this.files.set(path, content);
      return true;
    } catch (error) {
      console.error('File writeBytes error:', error);
      return false;
    }
  }

  appendFile(path: string, data: string): boolean {
    try {
      const existing = this.files.get(path) || '';
      this.files.set(path, existing + data);
      return true;
    } catch (error) {
      console.error('File append error:', error);
      return false;
    }
  }

  unlink(path: string): boolean {
    return this.files.delete(path);
  }

  mkdir(path: string, recursive: boolean = true): boolean {
    try {
      // 在内存文件系统中，目录只是空字符串
      this.files.set(path, '');
      return true;
    } catch (error) {
      console.error('File mkdir error:', error);
      return false;
    }
  }

  readdir(path: string): FileInfo[] | null {
    const prefix = path.endsWith('/') ? path : `${path}/`;
    const entries: FileInfo[] = [];

    this.files.forEach((content, filePath) => {
      if (filePath.startsWith(prefix)) {
        entries.push({
          path: filePath,
          size: content.length,
          isDirectory: false,
          lastModified: Date.now()
        });
      }
    });

    return entries.length > 0 ? entries : null;
  }

  stat(path: string): FileInfo | null {
    const content = this.files.get(path);
    if (content === undefined) return null;

    return {
      path,
      size: content.length,
      isDirectory: content === '',
      lastModified: Date.now()
    };
  }

  saveFile(tempPath: string, destPath: string): string | null {
    const content = this.files.get(tempPath);
    if (content === undefined) return null;

    this.files.set(destPath, content);
    this.files.delete(tempPath);
    return destPath;
  }

  /**
   * 清空所有文件
   */
  clear(): void {
    this.files.clear();
  }

  /**
   * 获取文件数量
   */
  getFileCount(): number {
    return this.files.size;
  }
}
