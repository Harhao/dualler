## Why

Dualler 是一个类 Vue3 语法的小程序引擎项目，目标是提供跨平台的原生渲染小程序解决方案。当前项目仅有设计文档和 README，缺少实际的代码实现。需要生成完整的 tasks 任务列表，指导从零开始构建整个小程序引擎框架。

## What Changes

- 创建完整的 monorepo 项目结构（pnpm workspace + Turbo）
- 实现编译器（dualler-compiler）：Vue3 SFC → DSL Bundle
- 实现 Runtime 三层拆分（core/renderer/api）
- 实现 Native SDK（Android/iOS）
- 实现 CLI 工具和开发服务器
- 实现构建插件（Vite/Rspack）
- 创建示例项目和测试 App

## Capabilities

### New Capabilities
- `compiler`: Vue3 SFC 编译为 DSL Bundle 的能力
- `runtime-core`: 逻辑层运行时（Page/Component/Router/API）
- `runtime-renderer`: 视图层渲染（VNode/Diff/Patch/Serializer）
- `runtime-api`: 系统 API 实现（网络/存储/文件/Toast 等）
- `native-sdk`: Android/iOS 原生 SDK（QuickJS/JavaScriptCore + Bridge）
- `cli`: 命令行工具（build/dev/preview/create）
- `dev-server`: 开发服务器（HTTP + WebSocket + HMR）
- `build-plugins`: Vite/Rspack 构建插件

## Impact

- 全新项目，无现有代码影响
- 需要创建完整的 monorepo 结构
- 依赖 pnpm、Turbo、QuickJS、JavaScriptCore
