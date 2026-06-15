/**
 * 数据模型定义
 */

// JS 值类型
export type JSValue =
  | { type: 'undefined' }
  | { type: 'null' }
  | { type: 'boolean'; value: boolean }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'array'; elements: JSValue[] }
  | { type: 'object'; properties: Record<string, JSValue> };

export const JSValue = {
  Undefined: (): JSValue => ({ type: 'undefined' }),
  Null: (): JSValue => ({ type: 'null' }),
  Boolean: (value: boolean): JSValue => ({ type: 'boolean', value }),
  Number: (value: number): JSValue => ({ type: 'number', value }),
  String: (value: string): JSValue => ({ type: 'string', value }),
  Array: (elements: JSValue[]): JSValue => ({ type: 'array', elements }),
  Object: (properties: Record<string, JSValue>): JSValue => ({ type: 'object', properties }),
};

// JS 数组
export interface JSArray {
  elements: JSValue[];
  getString(index: number): string;
  getNumber(index: number): number;
  getBoolean(index: number): boolean;
  get(index: number): JSValue;
  readonly size: number;
}

// DOM 事件
export interface DOMEvent {
  type: string;
  target: string;
  currentTarget: string;
  detail?: Record<string, any>;
  timestamp: number;
}

// API 结果
export type APIResult =
  | { type: 'success'; data: any }
  | { type: 'fail'; errCode: number; errMsg: string };

export const APIResult = {
  Success: (data: any): APIResult => ({ type: 'success', data }),
  Fail: (errCode: number, errMsg: string): APIResult => ({ type: 'fail', errCode, errMsg }),
};

// 网络请求
export interface NetworkRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: string;
  timeout?: number;
}

// 网络响应
export interface NetworkResponse {
  statusCode: number;
  header: Record<string, string>;
  data: string | null;
  cookies: string[];
}

// 上传配置
export interface UploadConfig {
  url: string;
  filePath: string;
  name: string;
  formData?: Record<string, string>;
}

// 下载配置
export interface DownloadConfig {
  url: string;
  filePath?: string;
}

// 下载结果
export type DownloadResult =
  | { type: 'progress'; percent: number; bytes: number }
  | { type: 'success'; filePath: string }
  | { type: 'failed'; error: string };

// 存储信息
export interface StorageInfo {
  keys: string[];
  currentSize: number;
  limitSize: number;
}

// 文件信息
export interface FileInfo {
  path: string;
  size: number;
  isDirectory: boolean;
  lastModified: number;
}

// 系统信息
export interface SystemInfo {
  brand: string;
  model: string;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  statusBarHeight: number;
  language: string;
  version: string;
  platform: string;
  SDKVersion: string;
}

// 振动类型
export type VibrateType = 'short' | 'long' | 'heavy' | 'medium' | 'light';

// 网络类型
export type NetworkType = 'wifi' | 'cellular_2g' | 'cellular_3g' | 'cellular_4g' | 'cellular_5g' | 'none' | 'unknown';
