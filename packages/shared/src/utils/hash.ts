import { createHash } from 'crypto';

export function calculateSHA256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
