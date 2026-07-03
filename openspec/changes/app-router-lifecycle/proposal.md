## Context

Dualler 是一个跨平台小程序引擎，目标平台为 Android、iOS 和 H5。当前架构中：

- **CLI**：编译产物固定命名为 `bundle.js` / `style.css`，不与微信小程序对齐
- **Runtime**：`router.ts` 仅维护页面栈字符串，不管理 WebView 创建/销毁；`page.ts` 有 `Page()` 但路由执行是纯内存操作
- **SDK**：`DuallerEngine` 是单例模式（Android `object` / iOS `sharedInstance`），只有一个 WebView 实例，无法做页面切换时的池化复用

## Versioning Strategy

| 版本 | 范围 | 目标 |
|------|------|------|
| **v1 (本 change)** | 编译产物命名 + App() 基础 API + Loader + Router WebView 集成 + SDK WebView 池 | 打通基建链路，让 Router 能管理 WebView 创建/回收 |
| **v2 (后续 change)** | 路由回调体系、tabBar、window 完整配置、setData 高级语义、Component behaviors/relations、分包、eventChannel 等 | 全面对齐微信小程序 API |

v1 完成后，小程序的核心能力是：**能编译、能注册 App、能路由、WebView 能被池化复用**。缺少回调、tabBar、高级 setData 等不影响基本运行。

v2 将在此基础上补齐 API 对齐。

## Goals / Non-Goals (v1 Only)

**Goals:**
- CLI 输出对齐微信小程序文件命名约定
- `App()` API 注册全局配置，管理应用生命周期
- Router 与 WebView 生命周期打通：导航时创建/回收 WebView
- Android/iOS SDK 对称实现 WebView 池

**Non-Goals (defer to v2):**
- 路由回调体系（success/fail/complete）
- tabBar 完整配置（midButton、iconPath、position 等）
- window 全局配置的 20+ 字段补全
- Component behaviors / relations / observers 路径表达式
- setData 高级语义（嵌套路径、函数式更新、自动 diff）
- 应用级 onError / onUnhandledPromiseRejection 接入运行时
- subpackages 分包加载
- 页面间 eventChannel
- 更多页面生命周期钩子（onReady、onPageScroll、onTabItemTap、onSaveExitState）
- 不改变现有 `Page()` / `Component()` API 的行为
- 不引入新的外部依赖
- 不修改 H5 平台的渲染逻辑（H5 已有成熟 DOM 体系）
- 不做热更新/远程加载

## Decisions

### D1: 编译产物命名 — 按页面路径派生文件名

**决定**：`dist/{pagePath}/{pageName}.js` + `{pageName}.css`，根目录 `app.js` + `app.css`

**理由**：与微信小程序 `pages/index/index.js` 约定完全一致。CLI 遍历 `config.pages` 时，对每个页面创建子目录，文件名取路径最后一段。

**备选**：
- 扁平命名 `index.js` / `detail.js` — 不利于大型项目，放弃
- 保持 `bundle.js` — 不与微信对齐，放弃

### D2: App() 作为独立 API，不侵入现有 Page()

**决定**：新建 `packages/dualler-runtime-core/src/app.ts`，导出 `App()` 函数

**理由**：`App()` 注册的是全局配置（如 `onLaunch`、`onHide`、`window` 全局样式），与 `Page()` 注册的页面配置是不同层级。`App()` 初始化后建立页面栈和全局状态，`Page()` 只是向注册表添加页面定义。

### D3: Router 管理 WebView 生命周期，通过 Loader 中介

**决定**：新建 `loader.ts` 负责 bundle/CSS 加载，Router 在 `executeRoute` 中调用 `loadPage()` / `unloadPage()`

**理由**：分离关注点 — Router 管导航决策，Loader 管资源加载。这样 SDK 层只需实现 `Loader` 接口即可适配不同的资源加载策略（本地文件、HTTP 下载等）。

```
Router.executeRoute()
  ├─ navigateTo → loader.loadPage(url) → 创建/显示 WebView
  ├─ navigateBack → loader.unloadPage(poppedRoute) → 隐藏/回收 WebView
  └─ switchTab → unloadStackAbove(tabUrl) + loadPage(tabUrl)
```

### D4: WebView 池 — LRU 策略，可配置上限

**决定**：Android `PageWebViewPool.kt` / iOS `PageWebViewPool.swift`，默认最大 5 个空闲 WebView

**理由**：小程序典型场景是 3-5 个页面深度。LRU 池避免无限增长，同时减少创建开销。

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| 编译产物命名变更导致旧 SDK 不兼容 | **BREAKING** | 同步发布 SDK 新版本；文档明确升级步骤 |
| WebView 池增加内存复杂度 | 中 | 提供 `maxCacheSize` 配置项；SDK 侧监听内存警告清空池 |
| `App()` 未调用时 Router 行为降级 | 低 | Router 仍可用，只是不管理 WebView；给出 warn 日志 |

## Migration Plan

1. **Phase 1**：先改 CLI 输出命名（无运行时影响）
2. **Phase 2**：新增 Runtime API（向后兼容 — 现有代码不传 `App()` 仍可工作）
3. **Phase 3-4**：SDK 改动（需配合新版 Runtime，建议一起发布）
4. **Phase 5**：更新示例和模板
5. **回滚**：CLI 命名可独立回滚；Runtime/SDK 回滚需降级到上一版本

## Open Questions

1. `App()` 是否需要 `globalData` 的响应式更新？v1 只支持普通赋值，v2 按需增强。
2. WebView 池的空闲回收是否应该加超时机制（如 30 秒空闲自动销毁）？v1 可不实现，通过 `maxCacheSize` 控制。
3. H5 平台是否需要在 loader 中支持 HTTP 动态下载 bundle？目前假设 bundle 已预置在原生资源中。
