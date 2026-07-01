import { PatchInstruction } from './types';

export interface BridgeMessage {
  type: 'patch' | 'api_call' | 'api_response' | 'event';
  payload: any;
  callbackId?: string;
  timestamp: number;
}

export function serializePatches(patches: PatchInstruction[]): BridgeMessage {
  return {
    type: 'patch',
    payload: { patches },
    timestamp: Date.now(),
  };
}

export function serializeAPICall(api: string, args: any, callbackId?: string): BridgeMessage {
  return {
    type: 'api_call',
    payload: { api, args },
    callbackId,
    timestamp: Date.now(),
  };
}

export function serializeEvent(eventName: string, data: any): BridgeMessage {
  return {
    type: 'event',
    payload: { event: eventName, data },
    timestamp: Date.now(),
  };
}
