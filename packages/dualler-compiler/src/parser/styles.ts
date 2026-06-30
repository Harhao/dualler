/**
 * Join all style block contents into a single CSS string.
 */
export function extractCSS(
  styles: Array<{ content: string; attrs: Record<string, string | boolean>; modules?: boolean }>
): string {
  return styles.map((s) => s.content).join('\n');
}
