## 1. Project Setup

- [x] 1.1 初始化 pnpm workspace 和 Turbo 配置
- [x] 1.2 创建 packages/ 目录结构（compiler, runtime-core, runtime-renderer, runtime-api, cli, dev-server, vite-plugin, rspack-plugin）
- [x] 1.3 创建 sdk/ 目录结构（android, ios, shared）
- [x] 1.4 创建 examples/ 目录结构（hello-world, todo-list, android-test-app, ios-test-app）
- [x] 1.5 配置 dualler-compiler 的 package.json（依赖 @vue/compiler-sfc 等）
- [x] 1.6 配置 dualler-runtime-core 的 package.json
- [x] 1.7 配置 dualler-runtime-renderer 的 package.json
- [x] 1.8 配置 dualler-runtime-api 的 package.json
- [x] 1.9 配置 dualler-cli 的 package.json
- [x] 1.10 配置 dualler-dev-server 的 package.json
- [x] 1.11 配置 dualler-vite-plugin 的 package.json
- [x] 1.12 配置 dualler-rspack-plugin 的 package.json
- [x] 1.13 配置 sdk/android/build.gradle.kts
- [x] 1.14 配置 sdk/ios/Package.swift
- [x] 1.15 配置 sdk/shared/build.gradle.kts（KMP 共享模块）

## 2. Compiler Implementation

- [x] 2.1 实现 parser/vue-sfc.ts（解析 Vue SFC 文件）
- [x] 2.2 实现 parser/styles.ts（CSS 预处理）
- [x] 2.3 实现 transformer/ast.ts（DSL AST 类型定义）
- [x] 2.4 实现 transformer/template.ts（<template> → DSL AST）
- [x] 2.5 实现 transformer/script.ts（<script setup> 处理）
- [x] 2.6 实现 transformer/style.ts（<style> → CSS 样式对象）
- [x] 2.7 实现 codegen/render.ts（DSL AST → VNode 树）
- [x] 2.8 实现 codegen/events.ts（事件绑定代码）
- [x] 2.9 实现 codegen/lifecycle.ts（生命周期代码）
- [x] 2.10 实现 bundle/bundler.ts（打包为 .bundle.js）
- [x] 2.11 实现 bundle/obfuscator.ts（代码混淆）
- [x] 2.12 实现 index.ts（对外 API: compile(source, options)）

## 3. Runtime Core Implementation

- [x] 3.1 实现 index.ts（创建 dualler 全局对象）
- [x] 3.2 实现 page.ts（Page() API，管理页面生命周期）
- [x] 3.3 实现 component.ts（Component() 注册，含 properties/observers）
- [x] 3.4 实现 observer.ts（响应式数据绑定，trigger setData 更新）
- [x] 3.5 实现 router.ts（页面路由，navigateTo/redirectTo/switchTab）
- [x] 3.6 实现 errors.ts（错误捕获和上报）

## 4. Runtime Renderer Implementation

- [x] 4.1 实现 index.ts（渲染器入口）
- [x] 4.2 实现 vnode.ts（VNode 数据结构）
- [x] 4.3 实现 diff.ts（差分算法，对比新旧 VNode 树）
- [x] 4.4 实现 patch.ts（差分指令生成）
- [x] 4.5 实现 serializer.ts（序列化：差分指令 → BridgeMessage）
- [x] 4.6 实现 transmitter.ts（传输：通过注入的通信接口发送）

## 5. Runtime API Implementation

- [x] 5.1 实现 index.ts（API 入口）
- [x] 5.2 实现 network.ts（dualler.request）
- [x] 5.3 实现 storage.ts（dualler.getStorageSync 等）
- [x] 5.4 实现 toast.ts（dualler.showToast）
- [x] 5.5 实现 navigation.ts（dualler.navigateTo）
- [x] 5.6 实现 filesystem.ts（dualler.getFileSystemManager）
- [x] 5.7 实现 device.ts（dualler.getSystemInfo）
- [x] 5.8 实现 canvas.ts（dualler.createCanvasContext）
- [x] 5.9 实现 media.ts（dualler.chooseImage/chooseVideo）
- [x] 5.10 实现 share.ts（dualler.onShareAppMessage）

## 6. Native SDK - Shared Protocol

- [x] 6.1 实现 BridgeMessage.kt（消息格式：type, payload, callbackId, timestamp）
- [x] 6.2 实现 DSLModel.kt（DSL 节点类型）
- [x] 6.3 实现 VNode.kt（VNode 类型）
- [x] 6.4 实现 APIContract.kt（dualler API 参数/返回值类型）
- [x] 6.5 实现 SandboxPaths.kt（沙盒路径定义）

## 7. Native SDK - Android

- [x] 7.1 实现 DuallerEngine.kt（引擎入口，一行初始化）
- [x] 7.2 实现 DuallerWebView.kt（WebView 封装）
- [x] 7.3 实现 QuickJsEngine.kt（QuickJS 封装）
- [x] 7.4 实现 BridgeManager.kt（通信中枢）
- [x] 7.5 实现 Parser.kt（消息解析）
- [x] 7.6 实现 Router.kt（消息路由）
- [x] 7.7 实现 NativeBridge.kt（JsEngine 和 Native 桥接）
- [x] 7.8 实现 JSAdapter.kt（WebView 适配层）
- [x] 7.9 实现 Handler.kt 接口定义
- [x] 7.10 实现 RequestHandler.kt（处理 dualler.request）
- [x] 7.11 实现 StorageHandler.kt（处理存储相关）
- [x] 7.12 实现 ToastHandler.kt（处理 Toast）
- [x] 7.13 实现 NavigationHandler.kt（处理导航）
- [x] 7.14 实现 FileSystemHandler.kt（处理文件系统）
- [x] 7.15 实现 DeviceHandler.kt（处理设备信息）
- [x] 7.16 实现 CanvasHandler.kt（处理 Canvas）
- [x] 7.17 实现 MediaHandler.kt（处理媒体）
- [x] 7.18 实现 ViewManager.kt（原生 UI 管理）
- [x] 7.19 实现 WebViewRenderer.kt（WebView 渲染）

## 8. Native SDK - iOS

- [x] 8.1 实现 DuallerEngine.swift（引擎入口）
- [x] 8.2 实现 DuallerWebView.swift（WebView 封装）
- [x] 8.3 实现 JSContextEngine.swift（JavaScriptCore 封装）
- [x] 8.4 实现 BridgeManager.swift（通信中枢）
- [x] 8.5 实现 Parser.swift（消息解析）
- [x] 8.6 实现 Router.swift（消息路由）
- [x] 8.7 实现 NativeBridge.swift（JSContext 和 Native 桥接）
- [x] 8.8 实现 JSAdapter.swift（WebView 适配层）
- [x] 8.9 实现 Handler.swift 接口定义
- [x] 8.10 实现 RequestHandler.swift（处理 dualler.request）
- [x] 8.11 实现 StorageHandler.swift（处理存储相关）
- [x] 8.12 实现 ToastHandler.swift（处理 Toast）
- [x] 8.13 实现 NavigationHandler.swift（处理导航）
- [x] 8.14 实现 FileSystemHandler.swift（处理文件系统）
- [x] 8.15 实现 DeviceHandler.swift（处理设备信息）
- [x] 8.16 实现 CanvasHandler.swift（处理 Canvas）
- [x] 8.17 实现 MediaHandler.swift（处理媒体）
- [x] 8.18 实现 ViewManager.swift（原生 UI 管理）
- [x] 8.19 实现 WebViewRenderer.swift（WebView 渲染）

## 9. CLI Implementation

- [x] 9.1 实现 index.ts（CLI 入口）
- [x] 9.2 实现 commands/build.ts（dualler build）
- [x] 9.3 实现 commands/preview.ts（dualler preview）
- [x] 9.4 实现 commands/create.ts（dualler create）
- [x] 9.5 实现 commands/create/prompts.ts（交互式问答）
- [x] 9.6 实现 commands/create/generator.ts（项目文件生成）
- [x] 9.7 实现 commands/create/templates/basic/（基础模板）
- [x] 9.8 实现 commands/create/templates/todo-list/（完整示例模板）
- [x] 9.9 实现 commands/create/templates/with-store/（状态管理模板）
- [x] 9.10 实现 utils/logger.ts（日志工具）

## 10. Dev Server Implementation

- [x] 10.1 实现 index.ts（开发服务器入口）
- [x] 10.2 实现 server.ts（HTTP + WebSocket 服务器）
- [x] 10.3 实现 watch.ts（文件监听）
- [x] 10.4 实现 hmr.ts（热更新逻辑）

## 11. Build Plugins Implementation

- [x] 11.1 实现 dualler-vite-plugin/src/index.ts（Vite 插件入口）
- [x] 11.2 实现 dualler-vite-plugin/src/transform.ts（Vite transform hook）
- [x] 11.3 实现 dualler-rspack-plugin/src/index.ts（Rspack 插件入口）
- [x] 11.4 实现 dualler-rspack-plugin/src/compiler.ts（Rspack compiler hook）

## 12. Examples and Test Apps

- [x] 12.1 实现 examples/hello-world/dualler.config.ts（项目配置）
- [x] 12.2 实现 examples/hello-world/src/App.vue（根组件）
- [x] 12.3 实现 examples/hello-world/src/pages/index.vue（首页）
- [x] 12.4 实现 examples/todo-list/dualler.config.ts（项目配置）
- [x] 12.5 实现 examples/todo-list/src/App.vue（根组件）
- [x] 12.6 实现 examples/todo-list/src/pages/index.vue（列表页）
- [x] 12.7 实现 examples/todo-list/src/pages/detail.vue（详情页）
- [x] 12.8 实现 examples/android-test-app/（Android 测试 App，集成 SDK）
- [x] 12.9 实现 examples/ios-test-app/（iOS 测试 App，集成 SDK）

## 13. Documentation

- [x] 13.1 编写 docs/architecture.md（整体架构设计）
- [x] 13.2 编写 docs/compiler.md（编译器设计细节）
- [x] 13.3 编写 docs/runtime.md（Runtime 设计细节）
- [x] 13.4 编写 docs/sdk-api.md（Native SDK API 文档）
- [x] 13.5 编写 docs/getting-started.md（快速开始指南）
