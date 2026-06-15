/**
 * Web Platform - 浏览器基座实现
 *
 * 让小程序引擎运行在 Web 环境中
 * - JS 引擎：Web Worker（隔离执行）
 * - 渲染层：Shadow DOM（样式隔离）
 * - 通信：postMessage（跨上下文）
 * - 存储：localStorage
 * - 网络：fetch API
 */

import type { Platform, JSEngine, WebViewProvider, PlatformBridge } from '../types/platform';
import type { NetworkProvider, StorageProvider, FileProvider, DeviceProvider } from '../types/providers';
import { WebWorkerJSEngine } from '../engine/WebWorkerJSEngine';
import { ShadowDOMWebView } from '../webview/ShadowDOMWebView';
import { WebPlatformBridge } from '../bridge/WebPlatformBridge';
import { FetchNetworkProvider } from '../api/FetchNetworkProvider';
import { LocalStorageProvider } from '../api/LocalStorageProvider';
import { MemoryFileProvider } from '../api/MemoryFileProvider';
import { BrowserDeviceProvider } from '../api/BrowserDeviceProvider';

export class WebPlatform implements Platform {
  readonly name = 'web';

  private _network: FetchNetworkProvider;
  private _storage: LocalStorageProvider;
  private _file: MemoryFileProvider;
  private _device: BrowserDeviceProvider;

  constructor() {
    this._network = new FetchNetworkProvider();
    this._storage = new LocalStorageProvider();
    this._file = new MemoryFileProvider();
    this._device = new BrowserDeviceProvider();
  }

  createJSEngine(): JSEngine {
    return new WebWorkerJSEngine();
  }

  createWebView(): WebViewProvider {
    return new ShadowDOMWebView();
  }

  createBridge(): PlatformBridge {
    return new WebPlatformBridge();
  }

  get network(): NetworkProvider {
    return this._network;
  }

  get storage(): StorageProvider {
    return this._storage;
  }

  get file(): FileProvider {
    return this._file;
  }

  get device(): DeviceProvider {
    return this._device;
  }
}
