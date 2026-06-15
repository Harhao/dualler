/**
 * @dualler/web - Dualler Web Platform
 *
 * 浏览器基座实现，让小程序引擎运行在 Web 环境中
 *
 * 架构：
 * - JS 引擎：Web Worker（隔离执行）
 * - 渲染层：Shadow DOM（样式隔离）
 * - 通信：postMessage（跨上下文）
 * - 存储：localStorage
 * - 网络：fetch API
 */

export { WebPlatform } from './platform/WebPlatform';
export { WebWorkerJSEngine } from './engine/WebWorkerJSEngine';
export { ShadowDOMWebView } from './webview/ShadowDOMWebView';
export { WebPlatformBridge } from './bridge/WebPlatformBridge';
export { FetchNetworkProvider } from './api/FetchNetworkProvider';
export { LocalStorageProvider } from './api/LocalStorageProvider';
export { MemoryFileProvider } from './api/MemoryFileProvider';
export { BrowserDeviceProvider } from './api/BrowserDeviceProvider';

// 导出类型
export type { Platform, JSEngine, WebViewProvider, PlatformBridge } from './types/platform';
export type { NetworkProvider, StorageProvider, FileProvider, DeviceProvider } from './types/providers';
export type { JSValue, JSArray, DOMEvent, APIResult } from './types/models';
