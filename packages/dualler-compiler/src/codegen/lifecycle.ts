/**
 * Wrap raw logic (script content) in an IIFE so it runs in an isolated scope
 * and can be safely concatenated with other generated code.
 */
export function generateLifecycleWrapper(logic: string): string {
  if (!logic.trim()) {
    return '(function() {})()';
  }

  return `(function() {\n${logic}\n})()`;
}
