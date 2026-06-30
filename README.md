# Dualler

类 Vue3 语法的小程序引擎，编译为 WebView 可运行的代码，符合微信小程序双线程模型。

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                  Native 线程                      │
│  ┌─────────────┐    ┌──────────────────────┐    │
│  │  WebView     │    │  BridgeManager       │    │
│  │  (视图层)     │    │  - 消息队列          │    │
│  │  纯渲染       │    │  - 路由分发          │    │
│  └──────▲───────┘    └──────────▲───────────┘    │
│         │                      │                 │
│         │    ←── 差分指令 ────→ │                 │
│         │    ←── 事件回调 ────→ │                 │
└─────────┼──────────────────────┼─────────────────┘
          │                      │
┌─────────┼──────────────────────┼─────────────────┐
│         │  独立 JS Context      │                 │
│         │  (逻辑层/Runtime)     │                 │
│  ┌──────▼──────────────────────┴──────────┐      │
│  │  dualler-runtime                        │      │
│  │  - Page/Component 管理                  │      │
│  │  - dualler.setData()                   │      │
│  │  - API 调用                            │      │
│  │  - 差分算法                             │      │
│  └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

## 核心特性

- **类 Vue3 语法**：`.vue` 单文件组件，`<script setup>` + `<template>` + `<style>`
- **双线程模型**：逻辑层（独立 JS Context）与视图层（WebView）完全隔离
- **跨平台**：一套源码编译为 Android / iOS 小程序
- **轻量引擎**：Android 端使用 QuickJS，iOS 端使用 JavaScriptCore
- **系统 API 全覆盖**：网络请求、存储、文件系统、路由、Toast、Canvas、媒体、分享等
- **分包加载**：支持主包 + 子包，按需下载
- **沙盒存储**：代码包存储在平台沙盒内，无需额外权限

## 目录结构

```
dualler/
├── packages/
│   ├── dualler-compiler/          # 编译器：Vue3 SFC → DSL Bundle
│   ├── dualler-runtime-core/      # Runtime 核心：Page/Component/Router/API
│   ├── dualler-runtime-renderer/  # Runtime 渲染：VNode/Diff/Patch/Serializer
│   ├── dualler-runtime-api/       # Runtime 系统 API
│   ├── dualler-cli/               # 命令行工具
│   ├── dualler-dev-server/        # 开发服务器
│   ├── dualler-vite-plugin/       # Vite 插件
│   └── dualler-rspack-plugin/     # Rspack 插件
├── sdk/
│   ├── android/                   # Android SDK（QuickJS）
│   ├── ios/                       # iOS SDK（JavaScriptCore）
│   └── shared/                    # 共享协议定义
├── examples/                      # 示例项目 + 测试 App
└── docs/                          # 文档
```

## 快速开始

### 安装

```bash
pnpm install
```

### 创建项目

```bash
pnpm dualler create my-app
```

交互式选择模板：
- `basic` — 最简 Hello World
- `todo-list` — 多页面 + 路由示例
- `with-store` — 带状态管理示例

### 开发

```bash
cd my-app
pnpm dualler dev
```

启动开发服务器，支持 HMR 热更新。

### 构建

```bash
pnpm dualler build
```

编译输出 `.bundle.js` 到 `dist/` 目录。

### 预览

```bash
pnpm dualler preview
```

本地预览编译产物。

## 运行时 API

```javascript
// 页面定义
Page({
  data: { count: 0 },
  onLoad() { /* 页面加载 */ },
  onShow() { /* 页面显示 */ },
  onTap() {
    this.setData({ count: this.data.count + 1 })
  },
})

// 系统 API
dualler.request({ url: '/api/data' })
dualler.getStorageSync('key')
dualler.showToast({ title: 'Success' })
dualler.navigateTo({ url: '/pages/detail' })
dualler.getFileSystemManager()
```

## 技术选型

| 层级 | 技术 |
|------|------|
| 包管理 | pnpm workspace |
| 构建编排 | Turbo |
| 编译器 | @vue/compiler-sfc |
| Android JS 引擎 | QuickJS |
| iOS JS 引擎 | JavaScriptCore |
| 构建插件 | Vite / Rspack |

## License

MIT
