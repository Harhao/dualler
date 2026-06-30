import type { CompileOptions, CompileResult } from './types';
import { parseVueSFC, extractCSS } from './parser';
import { transformTemplate, transformScript } from './transformer';
import { bundle } from './bundle';

/**
 * Main compile entry point.
 *
 * Pipeline:
 * 1. Parse Vue SFC → descriptor
 * 2. Extract CSS from style blocks
 * 3. Transform template AST → DSL node
 * 4. Return raw script content as logic
 */
export function compile(source: string, options: CompileOptions): CompileResult {
  const descriptor = parseVueSFC(source, options.filename).descriptor;

  // CSS
  const css = extractCSS(descriptor.styles ?? []);

  // Template → DSL
  const dsl = descriptor.template
    ? transformTemplate(descriptor.template.content)
    : { tag: 'view', props: [], children: [] };

  // Script → logic
  const logic = (descriptor.scripts?.[0]?.content ?? '').trim();

  return { dsl, css, logic };
}

/**
 * Compile and immediately bundle into a self-contained output string.
 */
export function compileToBundle(source: string, options: CompileOptions): string {
  const result = compile(source, options);
  return bundle(result);
}
