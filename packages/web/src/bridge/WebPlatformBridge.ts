/**
 * Web Platform Bridge
 *
 * 协调逻辑层（Worker）和渲染层（Shadow DOM）之间的通信
 */

import type { PlatformBridge, APIHandler } from '../types/platform';
import type { DOMEvent, APIResult } from '../types/models';
import { APIResult as APIResultFactory } from '../types/models';
import type { WebWorkerJSEngine } from '../engine/WebWorkerJSEngine';
import type { ShadowDOMWebView } from '../webview/ShadowDOMWebView';

export class WebPlatformBridge implements PlatformBridge {
  private apiHandlers: Map<string, APIHandler> = new Map();
  private pendingCallbacks: Map<string, (result: APIResult) => void> = new Map();
  private jsEngine: WebWorkerJSEngine | null = null;
  private webView: ShadowDOMWebView | null = null;

  /**
   * 连接 JS 引擎
   */
  connectEngine(engine: WebWorkerJSEngine): void {
    this.jsEngine = engine;

    // 设置回调
    engine.onDataSet = (pageId: string, data: Record<string, any>) => {
      this.setData(pageId, data);
    };

    engine.onApiCall = (api: string, params: Record<string, any>, callbackId: string) => {
      this.callNative(api, params, callbackId);
    };
  }

  /**
   * 连接 WebView
   */
  connectWebView(view: ShadowDOMWebView): void {
    this.webView = view;
  }

  setData(pageId: string, data: Record<string, any>): void {
    const json = JSON.stringify(data);
    // 发送到渲染层
    this.webView?.postMessage(JSON.stringify({
      type: 'setData',
      pageId,
      data: json
    }));
  }

  dispatchEvent(pageId: string, event: DOMEvent): void {
    const json = JSON.stringify(event);
    // 发送到逻辑层
    this.jsEngine?.sendEvent(pageId, json);
  }

  callNative(api: string, params: Record<string, any>, callbackId: string): void {
    const handler = this.apiHandlers.get(api);
    if (!handler) {
      if (callbackId) {
        this.invokeCallback(callbackId, APIResultFactory.Fail(-1, `Unknown API: ${api}`));
      }
      return;
    }

    // 存储回调
    if (callbackId) {
      this.pendingCallbacks.set(callbackId, (result) => {
        this.invokeCallback(callbackId, result);
      });
    }

    // 调用处理器
    handler.invoke(params, (result) => {
      if (callbackId) {
        this.invokeCallback(callbackId, result);
        this.pendingCallbacks.delete(callbackId);
      }
    });
  }

  invokeCallback(callbackId: string, result: APIResult): void {
    const json = result.type === 'success'
      ? JSON.stringify({ data: result.data })
      : JSON.stringify({ errCode: result.errCode, errMsg: result.errMsg });

    // 发送回调到 Worker
    this.jsEngine?.invokeCallback(callbackId, json);
  }

  registerAPI(name: string, handler: APIHandler): void {
    this.apiHandlers.set(name, handler);
  }

  /**
   * 获取已注册的 API 列表
   */
  getRegisteredAPIs(): string[] {
    return Array.from(this.apiHandlers.keys());
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.apiHandlers.clear();
    this.pendingCallbacks.clear();
    this.jsEngine = null;
    this.webView = null;
  }
}
