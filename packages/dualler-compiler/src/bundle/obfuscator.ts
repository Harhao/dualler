/**
 * Remove single-line and multi-line comments, collapse whitespace.
 */
export function obfuscate(code: string): string {
  // Remove single-line comments
  let result = code.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  // Collapse runs of whitespace
  result = result.replace(/\s{2,}/g, ' ');
  return result.trim();
}
