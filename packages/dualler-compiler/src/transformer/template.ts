import type { DSLNode } from '../types';

const SELF_CLOSING = new Set([
  'image', 'img', 'input', 'textarea', 'video', 'audio', 'canvas',
  'map', 'slider', 'switch', 'form', 'icon', 'progress', 'loading-view',
]);

const WHITESPACE_RE = /\s+/g;

interface Token {
  type: 'tag-open' | 'tag-close' | 'text' | 'eof';
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < input.length) {
    const ch = input[pos];

    if (ch === '<') {
      const closeIdx = input.indexOf('>', pos);
      if (closeIdx === -1) {
        throw new Error(`Malformed template: unclosed tag near position ${pos}`);
      }

      let tagText = input.slice(pos + 1, closeIdx);
      const isSelfClose = tagText.endsWith('/');
      if (isSelfClose) {
        tagText = tagText.slice(0, -1);
      }

      tokens.push({ type: 'tag-open', value: tagText.trim() });
      tokens.push({ type: 'tag-close', value: '' });

      // If self-closing tag, emit an immediate closing pair.
      if (SELF_CLOSING.has(tagText.split(/\s/)[0].toLowerCase()) || isSelfClose) {
        tokens.push({ type: 'tag-close', value: '/' + tagText });
      }

      pos = closeIdx + 1;
    } else if (ch === '\n' || ch === '\r') {
      pos++;
    } else {
      let end = pos;
      while (end < input.length && input[end] !== '<' && input[end] !== '\n' && input[end] !== '\r') {
        end++;
      }
      const text = input.slice(pos, end).trim();
      if (text) {
        tokens.push({ type: 'text', value: text });
      }
      pos = end;
    }
  }

  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

function parseAttrs(tagContent: string): { tagName: string; props: DSLNode['props']; events?: Record<string, string> } {
  const parts = tagContent.split(WHITESPACE_RE).filter(Boolean);
  if (!parts.length) return { tagName: '', props: [] };

  const tagName = parts[0];
  const props: DSLNode['props'] = [];
  const events: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];

    // Boolean attr: disabled, checked, hidden
    if (p.startsWith(':')) {
      props.push({ name: p.slice(1), value: true });
    } else if (p.startsWith('@')) {
      const eqIdx = p.indexOf('=');
      const eventName = p.slice(1, eqIdx === -1 ? p.length : eqIdx);
      const handlerBody = eqIdx === -1 ? '' : p.slice(eqIdx + 1);
      events[eventName] = handlerBody;
      props.push({ name: `bind:${eventName}`, value: handlerBody });
    } else if (p.includes('=')) {
      const eqIdx = p.indexOf('=');
      const name = p.slice(0, eqIdx);
      let value = p.slice(eqIdx + 1);
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      props.push({ name, value });
    } else {
      props.push({ name: p, value: true });
    }
  }

  return { tagName, props, events: Object.keys(events).length ? events : undefined };
}

export function transformTemplate(templateContent: string): DSLNode {
  const tokens = tokenize(templateContent);
  let pos = 0;

  function peek(): Token {
    return tokens[pos];
  }

  function advance(): Token {
    return tokens[pos++];
  }

  function parseElement(): DSLNode {
    const openToken = advance(); // tag-open
    if (openToken.type !== 'tag-open') {
      throw new Error(`Expected opening tag, got ${openToken.type}`);
    }

    const parsed = parseAttrs(openToken.value);
    const node: DSLNode = {
      tag: parsed.tagName,
      props: parsed.props,
      children: [],
      events: parsed.events,
    };

    // Collect children until matching close tag
    while (peek().type !== 'eof') {
      if (peek().type === 'tag-close') {
        advance(); // consume tag-close
        break;
      }

      const tok = advance();
      if (tok.type === 'text') {
        node.children.push({
          tag: 'text',
          props: [{ name: 'textContent', value: tok.value }],
          children: [],
        });
      } else if (tok.type === 'tag-open') {
        // Back-track — this token belongs to parseElement call.
        pos--;
        node.children.push(parseElement());
      }
    }

    return node;
  }

  // The template may contain multiple top-level elements.
  // If there's only one, wrap it; otherwise create a root container.
  const savedPos = pos;
  let topChildren: DSLNode[] = [];

  while (peek().type !== 'eof') {
    if (peek().type === 'tag-open') {
      topChildren.push(parseElement());
    } else {
      advance(); // skip non-element tokens
    }
  }

  if (topChildren.length === 1) {
    return topChildren[0];
  }

  // Wrap multiple roots in a single <view> container
  return {
    tag: 'view',
    props: [],
    children: topChildren,
  };
}
