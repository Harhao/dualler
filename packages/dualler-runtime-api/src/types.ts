export interface DuallerResponse<T = any> {
  data: T;
  errMsg: string;
  errno?: number;
}

export interface BaseCallback {
  success?: (res: any) => void;
  fail?: (err: DuallerResponse) => void;
  complete?: () => void;
}
