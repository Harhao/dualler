export interface BridgeMessage {
    id: string;
    type: MessageType;
    target: Target;
    method: string;
    pageId: string;
    payload: any;
    timestamp: number;
}
export type MessageType = 'setData' | 'event' | 'api' | 'callback' | 'lifecycle';
export type Target = 'logic' | 'render' | 'native';
//# sourceMappingURL=bridge.d.ts.map