import { VNode } from './vnode';
import { PatchInstruction } from './types';

export function diff(oldVNode: VNode | null, newVNode: VNode | null): PatchInstruction[] {
  const patches: PatchInstruction[] = [];
  walk(oldVNode, newVNode, '', patches);
  return patches;
}

function walk(
  oldNode: VNode | null,
  newNode: VNode | null,
  path: string,
  patches: PatchInstruction[]
): void {
  // both null
  if (!oldNode && !newNode) return;
  // removed
  if (oldNode && !newNode) {
    patches.push({ op: 'remove', path });
    return;
  }
  // added
  if (!oldNode && newNode) {
    patches.push({ op: 'add', path, value: serializeNode(newNode) });
    return;
  }
  // both exist — compare
  const old = oldNode!;
  const nw = newNode!;
  if (old.type !== nw.type || old.tag !== nw.tag || old.key !== nw.key) {
    // replaced
    patches.push({ op: 'update', path, value: serializeNode(nw) });
    return;
  }
  // same node — diff props
  diffProps(old, nw, path, patches);
  // same node — diff children
  diffChildren(old.children, nw.children, path + '/children', patches);
}

function diffProps(
  oldNode: VNode,
  newNode: VNode,
  path: string,
  patches: PatchInstruction[]
): void {
  const oldProps = oldNode.props || {};
  const newProps = newNode.props || {};
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  for (const key of allKeys) {
    const kp = path + '/props/' + key;
    if (!(key in oldProps)) {
      patches.push({ op: 'add', path: kp, value: newProps[key] });
    } else if (!(key in newProps)) {
      patches.push({ op: 'remove', path: kp });
    } else if (oldProps[key] !== newProps[key]) {
      patches.push({ op: 'update', path: kp, value: newProps[key] });
    }
  }
}

function diffChildren(
  oldChildren: VNode[],
  newChildren: VNode[],
  path: string,
  patches: PatchInstruction[]
): void {
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLen; i++) {
    walk(oldChildren[i], newChildren[i], `${path}/${i}`, patches);
  }
}

function serializeNode(node: VNode): any {
  return {
    type: node.type,
    tag: node.tag,
    props: node.props,
    children: node.children.map(serializeNode),
  };
}
