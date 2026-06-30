/**
 * Minimal script transformation: trim whitespace and return the raw content.
 * In a full implementation you would strip export blocks, convert ES modules, etc.
 */
export function transformScript(scriptContent: string): string {
  return scriptContent.trim();
}
