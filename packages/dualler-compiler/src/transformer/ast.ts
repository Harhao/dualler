import type { DSLNode } from '../types';

export function createDSLNode(
  tag: string,
  props?: Array<{ name: string; value: string | boolean | Record<string, any> }>,
  children?: DSLNode[],
  events?: Record<string, string>,
  key?: string
): DSLNode {
  return {
    tag,
    props: props ?? [],
    children: children ?? [],
    events,
    key,
  };
}
