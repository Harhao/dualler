import { BridgeMessage } from './serializer';

let sendFn: ((msg: BridgeMessage) => void) | null = null;

export function setTransmit(fn: (msg: BridgeMessage) => void): void {
  sendFn = fn;
}

export function transmit(msg: BridgeMessage): void {
  if (!sendFn) {
    console.warn('[dualler] transmitter: no send function registered, dropping message', msg.type);
    return;
  }
  sendFn(msg);
}

export function getTransmitFn(): ((msg: BridgeMessage) => void) | null {
  return sendFn;
}
