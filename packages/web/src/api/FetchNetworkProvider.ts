/**
 * Fetch Network Provider
 *
 * 基于 fetch API 的网络提供者
 */

import type { NetworkProvider } from '../types/platform';
import type { NetworkRequest, NetworkResponse, UploadConfig, DownloadConfig, DownloadResult } from '../types/models';

export class FetchNetworkProvider implements NetworkProvider {
  async request(config: NetworkRequest): Promise<NetworkResponse> {
    try {
      const headers = new Headers();
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          headers.append(key, value);
        });
      }

      const init: RequestInit = {
        method: config.method || 'GET',
        headers,
      };

      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || 'GET')) {
        init.body = config.data;
      }

      const response = await fetch(config.url, init);
      const body = await response.text();

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        statusCode: response.status,
        header: responseHeaders,
        data: body,
        cookies: []
      };
    } catch (error) {
      return {
        statusCode: -1,
        header: {},
        data: `Error: ${error instanceof Error ? error.message : String(error)}`,
        cookies: []
      };
    }
  }

  async uploadFile(config: UploadConfig): Promise<NetworkResponse> {
    try {
      const formData = new FormData();
      formData.append(config.name, config.filePath);

      if (config.formData) {
        Object.entries(config.formData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(config.url, {
        method: 'POST',
        body: formData
      });

      const body = await response.text();

      return {
        statusCode: response.status,
        header: {},
        data: body,
        cookies: []
      };
    } catch (error) {
      return {
        statusCode: -1,
        header: {},
        data: `Upload error: ${error instanceof Error ? error.message : String(error)}`,
        cookies: []
      };
    }
  }

  async downloadFile(config: DownloadConfig): Promise<DownloadResult> {
    try {
      const response = await fetch(config.url);
      const blob = await response.blob();

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.filePath || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        type: 'success',
        filePath: config.filePath || 'download'
      };
    } catch (error) {
      return {
        type: 'failed',
        error: `Download error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
