export { createElement, text, comment, fragment, VNode } from './vnode';
export { diff } from './diff';
export { applyPatches } from './patch';
export { serializePatches, serializeAPICall, serializeEvent, BridgeMessage } from './serializer';
export { setTransmit, transmit, getTransmitFn } from './transmitter';
export type { PatchInstruction } from './types';
