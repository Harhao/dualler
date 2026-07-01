export type VNodeType = 'element' | 'text' | 'fragment' | 'comment';

export interface VNode {
  type: VNodeType;
  tag: string;       // element name (e.g., 'div'), or '#' for text, '!' for comment, '@' for fragment
  props: Record<string, any> | null;
  children: VNode[];
  parent: VNode | null;
  key?: string | number;
}

export function createElement(
  type: VNodeType,
  tag: string,
  props: Record<string, any> | null,
  children: VNode[] = [],
  parent: VNode | null = null
): VNode {
  return { type, tag, props, children, parent, key: props?.key };
}

export function text(content: string): VNode {
  return createElement('text', '#', null, [], null);
}

export function comment(content: string = ''): VNode {
  return createElement('comment', '!', null, [], null);
}

export function fragment(children: VNode[]): VNode {
  return createElement('fragment', '@', null, children, null);
}
