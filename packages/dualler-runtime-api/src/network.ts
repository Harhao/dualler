interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  header?: Record<string, string>;
  data?: string | object;
  dataType?: string;
  responseType?: string;
  success?: (res: ResponseResult) => void;
  fail?: (res: DuallerResponseResult) => void;
  complete?: (res: ResponseResult & DuallerResponseResult) => void;
}

interface ResponseResult {
  data: string | object;
  statusCode: number;
  header: Record<string, string>;
  errMsg: string;
}

interface DuallerResponseResult {
  errMsg: string;
  statusCode?: number;
}

export function request(options: RequestOptions): { abort: () => void } {
  const { success, fail, complete, ...rest } = options;

  const abortController = new AbortController();

  const task = {
    abort(): void {
      abortController.abort();
    },
  };

  // Prepare data
  let postData: string | undefined;
  if (rest.data && typeof rest.data === 'object' && !(rest.data instanceof File)) {
    postData = JSON.stringify(rest.data);
  } else {
    postData = rest.data as string | undefined;
  }

  // Simulate async bridge call
  setTimeout(() => {
    if (success) {
      success({
        data: postData ? JSON.parse(postData) : '',
        statusCode: 200,
        header: rest.header || {},
        errMsg: 'request:ok',
      });
    }
    if (complete) {
      complete({
        data: postData ? JSON.parse(postData) : '',
        statusCode: 200,
        header: rest.header || {},
        errMsg: 'request:ok',
      });
    }
  }, 0);

  return task;
}
