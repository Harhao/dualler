/**
 * LocalStorage Provider
 *
 * 基于 localStorage 的存储提供者
 */

import type { StorageProvider } from '../types/platform';
import type { StorageInfo } from '../types/models';

export class LocalStorageProvider implements StorageProvider {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  getKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return [];
    }
  }

  getInfo(): StorageInfo {
    const keys = this.getKeys();
    let currentSize = 0;

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        currentSize += key.length + value.length;
      }
    });

    return {
      keys,
      currentSize,
      limitSize: 5 * 1024 * 1024 // 5MB
    };
  }
}
