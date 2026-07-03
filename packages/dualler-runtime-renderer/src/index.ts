export type { VNode, VNodeType } from './vnode';
export { createElement, text, comment, fragment } from './vnode';
export { diff } from './diff';
export { applyPatches } from './patch';
export type { BridgeMessage } from './serializer';
export { serializePatches, serializeAPICall, serializeEvent } from './serializer';
export { setTransmit, transmit, getTransmitFn } from './transmitter';
export type { PatchInstruction } from './types';
