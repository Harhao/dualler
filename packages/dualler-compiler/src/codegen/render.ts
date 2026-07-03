import type { DSLNode } from '../types';

interface GenCtx {
  indent: number;
}

function pad(ctx: GenCtx): string {
  return '  '.repeat(ctx.indent);
}

function escapeJS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Generate a JS expression for a DSLNode prop value.
 */
function propValueExpr(value: string | boolean | Record<string, any>): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return `"${escapeJS(value)}"`;
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

/**
 * Generate `createElement(tag, props, children)` call for a DSL node.
 */
function generateNode(node: DSLNode, ctx: GenCtx): string {
  const lines: string[] = [];
  const p = pad(ctx);

  // Props object
  const propEntries = (node.props || []).map((prop) => {
    return `    ${prop.name}: ${propValueExpr(prop.value)}`;
  });
  const propsObj = propEntries.length
    ? `{\n${propEntries.join(',\n')}\n  }`
    : 'null';

  // Children array
  if (node.children.length) {
    const childCtx: GenCtx = { indent: ctx.indent + 2 };
    const childCalls = node.children.map((c) => generateNode(c, childCtx));
    lines.push(`${p}createElement("${node.tag}", ${propsObj}, [`);
    lines.push(childCalls.join(',\n'));
    lines.push(`${p})`);
  } else {
    lines.push(`${p}createElement("${node.tag}", ${propsObj}, [])`);
  }

  return lines.join('\n');
}

/**
 * Generate `text(content)` call for a text node.
 */
function generateTextNode(content: string): string {
  return `text("${escapeJS(content)}")`;
}

/**
 * Walk the DSL tree and generate a JS render function string.
 * Text content inside elements is extracted and wrapped in text() calls.
 */
function walkNode(node: DSLNode, ctx: GenCtx): string {
  // Check if node has only text children (leaf text element)
  const hasTextChildren = node.children.length > 0 &&
    node.children.every((c) => c.tag === 'text' && (c.props || []).some((p) => p.name === 'textContent'));

  if (hasTextChildren && node.children.length === 1) {
    const textProp = node.children[0].props!.find((p) => p.name === 'textContent');
    return generateTextNode(textProp!.value as string);
  }

  // Regular element — generate createElement call
  const childCtx: GenCtx = { indent: ctx.indent + 1 };
  const children = node.children.map((child) => {
    if (child.tag === 'text' && (child.props || []).some((p) => p.name === 'textContent')) {
      const textProp = child.props!.find((p) => p.name === 'textContent');
      return generateTextNode(textProp!.value as string);
    }
    return walkNode(child, childCtx);
  });

  const propEntries = (node.props || []).map((prop) => {
    return `    ${prop.name}: ${propValueExpr(prop.value)}`;
  });
  const propsObj = propEntries.length
    ? `{\n${propEntries.join(',\n')}\n  }`
    : 'null';

  const childrenPart = children.length
    ? ', [\n' + children.map((c) => '    ' + c).join(',\n') + '\n  ]'
    : ', []';

  return [
    `${pad(ctx)}createElement("${node.tag}", ${propsObj}${childrenPart}`,
  ].join('');
}

export function generateVNodeRender(root: DSLNode): string {
  const body = walkNode(root, { indent: 1 });
  return `function render() {\n${body}\n}`;
}
