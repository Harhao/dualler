/**
 * 平台接口定义
 */

export interface Platform {
  readonly name: string;
  createJSEngine(): JSEngine;
  createWebView(): WebViewProvider;
  createBridge(): PlatformBridge;
  readonly network: NetworkProvider;
  readonly storage: StorageProvider;
  readonly file: FileProvider;
  readonly device: DeviceProvider;
}

export interface JSEngine {
  evaluateScript(script: string, sourceUrl?: string): JSValue;
  registerCallback(name: string, callback: (args: JSArray) => JSValue): void;
  registerObject(name: string, obj: Record<string, (args: JSArray) => JSValue>): void;
  destroy(): void;
}

export interface WebViewProvider {
  loadUrl(url: string): void;
  loadHtml(html: string, baseUrl?: string): void;
  evaluateJavascript(script: string, callback?: (result: string) => void): void;
  addJavascriptInterface(name: string, handler: (message: string) => void): void;
  injectCSS(css: string): void;
  injectScript(script: string): void;
  configure(config: WebViewConfig): void;
  destroy(): void;
}

export interface WebViewConfig {
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  allowFileAccess?: boolean;
  userAgent?: string;
  virtualDomain?: string;
}

export interface PlatformBridge {
  setData(pageId: string, data: Record<string, any>): void;
  dispatchEvent(pageId: string, event: DOMEvent): void;
  callNative(api: string, params: Record<string, any>, callbackId: string): void;
  invokeCallback(callbackId: string, result: APIResult): void;
  registerAPI(name: string, handler: APIHandler): void;
}

export interface APIHandler {
  invoke(params: Record<string, any>, callback: (result: APIResult) => void): void;
}

export interface NetworkProvider {
  request(config: NetworkRequest): Promise<NetworkResponse>;
  uploadFile(config: UploadConfig): Promise<NetworkResponse>;
  downloadFile(config: DownloadConfig): Promise<DownloadResult>;
}

export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  getKeys(): string[];
  getInfo(): StorageInfo;
}

export interface FileProvider {
  readFile(path: string, encoding?: string): string | null;
  readFileBytes(path: string): Uint8Array | null;
  writeFile(path: string, data: string, encoding?: string): boolean;
  writeFileBytes(path: string, data: Uint8Array): boolean;
  appendFile(path: string, data: string): boolean;
  unlink(path: string): boolean;
  mkdir(path: string, recursive?: boolean): boolean;
  readdir(path: string): FileInfo[] | null;
  stat(path: string): FileInfo | null;
  saveFile(tempPath: string, destPath: string): string | null;
}

export interface DeviceProvider {
  getSystemInfo(): SystemInfo;
  vibrate(type: VibrateType): void;
  getNetworkType(): NetworkType;
}
