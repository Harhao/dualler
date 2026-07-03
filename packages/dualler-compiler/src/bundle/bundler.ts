import type { CompileResult } from '../types';
import { generateVNodeRender, generateBundle as generateBundleCode } from '../codegen';

const BUNDLE_HEADER = '/* dualler-bundle-v1 */\n';

/**
 * Compile a Vue SFC into a self-contained bundle.js (logic layer JS).
 *
 * Pipeline:
 * 1. Transform DSL tree → VNode render function (JS code)
 * 2. Assemble: CSS injection + render function + Page() registration
 */
export function bundle(result: CompileResult): string {
  const vnodeRender = generateVNodeRender(result.dsl);
  return generateBundleCode(vnodeRender, result.css);
}
