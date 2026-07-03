import type { DSLNode } from '../types';

/**
 * Walk the DSL tree and collect event bindings from all nodes.
 * Returns a string of JS assignments mapping event names to handler bodies.
 */
export function generateEventBindings(node: DSLNode): string {
  const bindings: string[] = [];

  function walk(n: DSLNode) {
    if (n.events) {
      for (const [event, handler] of Object.entries(n.events)) {
        bindings.push(`this.bind${event} = () => { ${handler} }`);
      }
    }
    for (const child of n.children) {
      walk(child);
    }
  }

  walk(node);
  return bindings.join('\n');
}

/**
 * @deprecated Use generateEventBindings instead.
 */
export const generateEventHandlers = generateEventBindings;
