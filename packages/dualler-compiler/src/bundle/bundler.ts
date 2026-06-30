import type { CompileResult } from '../types';

const BUNDLE_HEADER = '/* dualler-bundle-v1 */\n';

/**
 * Combine render DSL, CSS, and lifecycle logic into a single self-contained
 * bundle string.
 */
export function bundle(result: CompileResult): string {
  const parts: string[] = [];

  parts.push(BUNDLE_HEADER);
  parts.push(`/* DSL */\n${JSON.stringify(result.dsl, null, 2)}`);
  parts.push(`\n/* CSS */\n\n`);
  if (result.css) {
    parts.push(result.css);
  }
  parts.push(`\n\n/* Logic */\n`);
  if (result.logic) {
    parts.push(result.logic);
  }

  return parts.join('');
}
