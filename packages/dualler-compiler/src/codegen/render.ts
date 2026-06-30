import type { DSLNode } from '../types';

interface GenCtx {
  indent: number;
}

function pad(ctx: GenCtx): string {
  return '  '.repeat(ctx.indent);
}

export function generateNode(node: DSLNode, ctx: GenCtx): string {
  const lines: string[] = [];
  const p = pad(ctx);

  lines.push(`${p}${node.tag}(`);

  // Props
  const propStrs = node.props.map((prop) => {
    if (typeof prop.value === 'boolean') {
      return `  ${prop.name}: true`;
    }
    if (typeof prop.value === 'string') {
      return `  ${prop.name}: "${escapeJS(prop.value)}"`;
    }
    if (typeof prop.value === 'object' && prop.value !== null) {
      return `  ${prop.name}: ${JSON.stringify(prop.value)}`;
    }
    return `  ${prop.name}: ${String(prop.value)}`;
  });
  if (propStrs.length) {
    lines.push(propStrs.join(',\n'));
  }

  // Events
  if (node.events) {
    for (const [event, handler] of Object.entries(node.events)) {
      lines.push(`  bind:${event}: "${handler}"`);
    }
  }

  // Key
  if (node.key) {
    lines.push(`  key: "${escapeJS(node.key)}"`);
  }

  // Children
  if (node.children.length) {
    lines.push('  children: [');
    const childCtx: GenCtx = { indent: ctx.indent + 1 };
    const childLines = node.children.map((c) => generateNode(c, childCtx));
    lines.push(childLines.join(',\n').split('\n').map((l) => `    ${l}`).join('\n'));
    lines.push('  ]');
  }

  lines.push(`${p})`);
  return lines.join('\n');
}

function escapeJS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

export function generateRenderFunction(root: DSLNode): string {
  const ctx: GenCtx = { indent: 0 };
  const body = generateNode(root, ctx);
  return `(function render() {\n${body}\n})`;
}
