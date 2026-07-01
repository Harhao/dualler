export interface ShareAppMessageResult {
  errMsg: string;
  shareTicket?: string;
  userInfo?: any;
}

export function onShareAppMessage<T>(options: {
  title?: string;
  path?: string;
  success?: (res: ShareAppMessageResult) => void;
  fail?: (err: any) => void;
}): void {
  console.log(`[share] onShareAppMessage(title=${options.title ?? '(default)'})`);
  options.success?.({ errMsg: 'onShareAppMessage:ok' });
}
