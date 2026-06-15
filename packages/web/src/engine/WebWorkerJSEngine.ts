/**
 * Web Worker JS Engine
 *
 * 小程序 JS 代码在独立的 Worker 线程中执行，与主线程隔离
 * 通过 postMessage 进行通信
 */

import type { JSEngine } from '../types/platform';
import type { JSValue, JSArray } from '../types/models';
import { JSValue as JSValueFactory } from '../types/models';

export class WebWorkerJSEngine implements JSEngine {
  private worker: Worker | null = null;
  private callbacks: Map<string, (args: JSArray) => JSValue> = new Map();
  private pendingResults: Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }> = new Map();
  private messageId = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    try {
      // 创建 Worker 脚本
      const workerScript = this.createWorkerScript();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      this.worker = new Worker(url);

      // 设置消息处理
      this.worker.onmessage = (event: MessageEvent) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error);
      };

      // 清理 Blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create Worker:', error);
    }
  }

  private createWorkerScript(): string {
    return `
      'use strict';

      // Dualler 运行时变量
      var __dualler_pages__ = {};
      var __dualler_app__ = {};
      var __dualler_currentPage__ = null;
      var __dualler_callbacks__ = {};
      var __dualler_callback_id__ = 0;

      // 消息处理
      self.onmessage = function(e) {
        var msg = e.data;
        switch(msg.type) {
          case 'eval':
            try {
              var result = eval(msg.script);
              self.postMessage({
                type: 'result',
                id: msg.id,
                result: result !== undefined ? JSON.stringify(result) : 'null'
              });
            } catch(err) {
              self.postMessage({
                type: 'error',
                id: msg.id,
                error: err.message,
                stack: err.stack
              });
            }
            break;

          case 'event':
            try {
              if (typeof __dualler_event__ === 'function') {
                __dualler_event__(msg.pageId, JSON.parse(msg.event));
              }
            } catch(err) {
              self.postMessage({
                type: 'error',
                error: 'Event handling error: ' + err.message
              });
            }
            break;

          case 'callback':
            try {
              var fn = __dualler_callbacks__[msg.callbackId];
              if (fn) {
                var args = JSON.parse(msg.args);
                fn(args);
                delete __dualler_callbacks__[msg.callbackId];
              }
            } catch(err) {
              self.postMessage({
                type: 'error',
                error: 'Callback error: ' + err.message
              });
            }
            break;
        }
      };

      // wx API
      var wx = {
        request: function(opts) {
          var id = 'cb_' + (++__dualler_callback_id__);
          if (opts.success) __dualler_callbacks__[id] = opts.success;
          if (opts.fail) __dualler_callbacks__[id + '_fail'] = opts.fail;
          self.postMessage({
            type: 'api',
            api: 'request',
            params: JSON.stringify(opts),
            callbackId: id
          });
        },
        navigateTo: function(opts) {
          self.postMessage({
            type: 'api',
            api: 'navigateTo',
            params: JSON.stringify(opts),
            callbackId: ''
          });
        },
        navigateBack: function(opts) {
          self.postMessage({
            type: 'api',
            api: 'navigateBack',
            params: JSON.stringify(opts || {}),
            callbackId: ''
          });
        },
        showToast: function(opts) {
          self.postMessage({
            type: 'api',
            api: 'showToast',
            params: JSON.stringify(opts),
            callbackId: ''
          });
        },
        getSystemInfo: function(opts) {
          var id = 'cb_' + (++__dualler_callback_id__);
          if (opts.success) __dualler_callbacks__[id] = opts.success;
          self.postMessage({
            type: 'api',
            api: 'getSystemInfo',
            params: '{}',
            callbackId: id
          });
        },
        createWorker: function(scriptPath) {
          return {
            postMessage: function(data) {
              self.postMessage({
                type: 'worker',
                action: 'postMessage',
                scriptPath: scriptPath,
                data: JSON.stringify(data)
              });
            },
            onMessage: function(handler) {
              __dualler_callbacks__['worker_' + scriptPath] = handler;
            },
            terminate: function() {
              self.postMessage({
                type: 'worker',
                action: 'terminate',
                scriptPath: scriptPath
              });
            }
          };
        }
      };

      // Dualler 运行时函数
      function __dualler_ref(value) {
        return { value: value };
      }

      function __dualler_reactive(obj) {
        return new Proxy(obj, {
          set: function(target, key, value) {
            target[key] = value;
            if (__dualler_currentPage__) {
              self.postMessage({
                type: 'setData',
                pageId: __dualler_currentPage__,
                data: JSON.stringify({[key]: value})
              });
            }
            return true;
          }
        });
      }

      function __dualler_page__(pageId, options) {
        __dualler_pages__[pageId] = options;
        if (options.setup) {
          __dualler_pages__[pageId]._data = options.setup();
        }
      }

      function __dualler_event__(pageId, event) {
        var page = __dualler_pages__[pageId];
        if (page && page.methods && page.methods[event.type]) {
          page.methods[event.type].call(page._data, event);
        }
      }

      function __dualler_call(api, params, callback) {
        var id = 'cb_' + (++__dualler_callback_id__);
        if (callback) {
          __dualler_callbacks__[id] = callback;
        }
        self.postMessage({
          type: 'api',
          api: api,
          params: JSON.stringify(params),
          callbackId: id
        });
      }

      function __dualler_callback__(callbackId, result) {
        var cb = __dualler_callbacks__[callbackId];
        if (cb) {
          cb(result);
          delete __dualler_callbacks__[callbackId];
        }
      }

      // 通知主线程 Worker 已就绪
      self.postMessage({ type: 'ready' });
    `;
  }

  private handleWorkerMessage(msg: any): void {
    switch (msg.type) {
      case 'ready':
        // Worker 已就绪
        break;

      case 'result':
        // 脚本执行结果
        const pending = this.pendingResults.get(msg.id);
        if (pending) {
          pending.resolve(msg.result);
          this.pendingResults.delete(msg.id);
        }
        break;

      case 'error':
        // 脚本执行错误
        if (msg.id) {
          const pendingError = this.pendingResults.get(msg.id);
          if (pendingError) {
            pendingError.reject(new Error(msg.error));
            this.pendingResults.delete(msg.id);
          }
        } else {
          console.error('Worker error:', msg.error);
        }
        break;

      case 'setData':
        // 数据更新，需要转发到渲染层
        this.onDataSet?.(msg.pageId, JSON.parse(msg.data));
        break;

      case 'api':
        // API 调用，需要转发到 Bridge
        this.onApiCall?.(msg.api, JSON.parse(msg.params), msg.callbackId);
        break;

      case 'worker':
        // Worker 子线程操作
        this.onWorkerAction?.(msg.action, msg.scriptPath, msg.data);
        break;
    }
  }

  // 外部回调
  onDataSet?: (pageId: string, data: Record<string, any>) => void;
  onApiCall?: (api: string, params: Record<string, any>, callbackId: string) => void;
  onWorkerAction?: (action: string, scriptPath: string, data?: string) => void;

  evaluateScript(script: string, sourceUrl: string = 'dualler://inline'): JSValue {
    if (!this.worker) {
      return JSValueFactory.Undefined();
    }

    const id = String(++this.messageId);

    this.worker.postMessage({
      type: 'eval',
      id,
      script
    });

    // 返回 Undefined，实际结果通过回调处理
    return JSValueFactory.Undefined();
  }

  evaluateScriptAsync(script: string, sourceUrl: string = 'dualler://inline'): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = String(++this.messageId);

      this.pendingResults.set(id, { resolve, reject });

      this.worker.postMessage({
        type: 'eval',
        id,
        script
      });
    });
  }

  registerCallback(name: string, callback: (args: JSArray) => JSValue): void {
    this.callbacks.set(name, callback);
  }

  registerObject(name: string, obj: Record<string, (args: JSArray) => JSValue>): void {
    for (const [key, fn] of Object.entries(obj)) {
      this.callbacks.set(`${name}.${key}`, fn);
    }
  }

  sendEvent(pageId: string, event: string): void {
    this.worker?.postMessage({
      type: 'event',
      pageId,
      event
    });
  }

  invokeCallback(callbackId: string, args: string): void {
    this.worker?.postMessage({
      type: 'callback',
      callbackId,
      args
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.callbacks.clear();
    this.pendingResults.clear();
  }
}
