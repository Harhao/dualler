## Context

Dualler 是全新项目，目标是从零构建一个类 Vue3 语法的小程序引擎。项目采用 monorepo 架构，包含编译器、Runtime、Native SDK、CLI 等多个包。

## Goals / Non-Goals

**Goals:**
- 建立完整的项目骨架和架构
- 实现双线程模型（逻辑层 + 视图层）
- 提供跨平台 Native SDK（Android/iOS）
- 支持类 Vue3 语法的 .vue 文件编译

**Non-Goals:**
- 不包含完整的系统 API 实现（仅提供框架）
- 不包含完整的错误处理和调试能力
- 不包含分包加载的运行时实现
- 不包含媒体和设备能力 API

## Decisions

### 1. 使用 pnpm workspace + Turbo 作为 monorepo 方案
- **理由**：pnpm 有严格的依赖隔离，Turbo 提供高效的构建编排
- **替代方案**：yarn workspaces / npm workspaces — 但不如 pnpm 严格
- **替代方案**：Lerna — 已过时，不推荐

### 2. Runtime 拆分为三个独立包
- **理由**：单一职责，core（逻辑）/renderer（差分）/api（系统）各司其职
- **替代方案**：单一 runtime 包 — 但职责模糊，难以维护

### 3. Android 使用 QuickJS，iOS 使用 JavaScriptCore
- **理由**：QuickJS 轻量、启动快；JavaScriptCore 是 iOS 系统自带
- **替代方案**：V8 — 太重，不符合小程序场景
- **替代方案**：SpiderMonkey — 文档少，社区支持弱

### 4. Bridge 通信采用消息队列 + 路由模式
- **理由**：对齐微信小程序的 JSBridge 设计，清晰的分层（Manager → Parser → Router → Handler）
- **替代方案**：直接方法调用 — 但无法处理异步和批量消息

### 5. 编译产物为 .bundle.js（明文 JS）
- **理由**：开发友好，便于调试和 HMR
- **风险**：源码可见，生产环境需额外混淆
- **缓解**：bundle.ts 中加入代码混淆步骤

## Risks / Trade-offs

### [风险] QuickJS 与 V8 API 不一致
- **影响**：Runtime 代码可能需要条件判断
- **缓解**：通过 NativeBridge 抽象层隔离引擎差异

### [风险] Runtime 包拆分过多导致依赖复杂
- **影响**：core/renderer/api 三者之间的引用需要仔细管理
- **缓解**：明确依赖方向 core → renderer → api，不形成环

### [风险] Native SDK 实现成本高
- **影响**：Android 和 iOS 各自实现 BridgeManager/Handler/Renderer
- **缓解**：shared 模块共享协议定义，减少重复代码

### [风险] 编译产物保护不足
- **影响**：.bundle.js 明文可读
- **缓解**：bundle.ts 中加入混淆，后续可引入加密

## Migration Plan

全新项目，无迁移计划。

## Open Questions

1. QuickJS 的 Android 封装库选择？（quickjs-engine-android / 自研）
2. 编译产物是否需要二进制化保护？
3. 分包加载的运行时实现优先级？
4. 错误上报的目标平台？（自建 / 接入第三方）
