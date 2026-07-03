## 1. CLI 编译产物重命名

- [x] 1.1 修改 `packages/dualler-cli/src/commands/build.ts`，将 `bundle.js` 改为 `{pageName}.js`
- [x] 1.2 修改 `packages/dualler-cli/src/commands/build.ts`，将 `style.css` 改为 `{pageName}.css`
- [x] 1.3 新增 `app.js` / `app.css` 编译输出逻辑（合并所有页面的全局样式 + 空 bundle）
- [x] 1.4 验证编译产物目录结构符合 `dist/{pagePath}/{pageName}.{js,css}` 约定

## 2. Runtime — App() API

- [x] 2.1 创建 `packages/dualler-runtime-core/src/app.ts`，实现 `App()` 函数（注册全局配置、生命周期钩子）
- [x] 2.2 实现 `getApp()` 辅助函数，返回全局 app 实例
- [x] 2.3 实现 `AppOptions` 类型定义（`onLaunch`、`onShow`、`onHide`、`globalData`、`window`）
- [x] 2.4 实现 `onLaunch` 自动调用逻辑
- [x] 2.5 实现 window 配置合并逻辑（app 默认值 ← 页面覆盖）
- [x] 2.6 在 `packages/dualler-runtime-core/src/index.ts` 导出 `App`、`getApp`、`AppOptions`

## 3. Runtime — Loader（页面加载/卸载）

- [x] 3.1 创建 `packages/dualler-runtime-core/src/loader.ts`，定义 `PageLoader` 接口
- [x] 3.2 实现默认 `PageLoader`：从本地路径加载 `{pageName}.js` 和 `{pageName}.css`
- [x] 3.3 实现 `loadPage(route)`：bundle 评估 + CSS 注入 + 去重
- [x] 3.4 实现 `unloadPage(route)`：CSS 移除 + 调用 `onUnload` 钩子
- [x] 3.5 实现 `resolvePagePath(route)`：`pages/detail/detail` → `pages/detail/detail.js`
- [x] 3.6 添加 `onLoad` 错误处理：文件不存在时调用 error handler

## 4. Runtime — Router 集成 WebView 生命周期

- [x] 4.1 修改 `packages/dualler-runtime-core/src/router.ts`，引入 `PageLoader`
- [x] 4.2 在 `executeRoute(navigateTo)` 中调用 `loader.loadPage(url)`
- [x] 4.3 在 `executeRoute(navigateBack)` 中调用 `loader.unloadPage(poppedRoute)`
- [x] 4.4 在 `executeRoute(redirectTo)` 中先 unload 当前页再 load 新页
- [x] 4.5 在 `executeRoute(switchTab)` 中清理 tab 上方的页面 WebView
- [x] 4.6 在 `executeRoute(reLaunch)` 中清空所有页面 WebView
- [x] 4.7 实现 `markPageLoaded(route)` / `isPageLoaded(route)` 去重判断
- [x] 4.8 在 `packages/dualler-runtime-core/src/index.ts` 导出 `PageLoader` 类型

## 5. Android SDK — WebView 池

- [x] 5.1 创建 `sdk/android/.../bridge/PageWebViewPool.kt`
- [x] 5.2 实现 `acquire(route): DuallerWebView` 方法
- [x] 5.3 实现 `release(webView: DuallerWebView)` 方法
- [x] 5.4 实现 LRU 淘汰策略（基于访问顺序）
- [x] 5.5 实现 `destroyOldest()` 释放最久未使用的 WebView
- [x] 5.6 添加 `maxCacheSize` 配置项（默认 5）

## 6. Android SDK — Engine 集成

- [x] 6.1 修改 `sdk/android/.../DuallerEngine.kt`，将单例 WebView 改为池化管理
- [x] 6.2 `init()` 中创建 `PageWebViewPool` 实例
- [x] 6.3 `DuallerEngineInstance` 新增 `pool: PageWebViewPool` 字段
- [x] 6.4 修改 `DuallerWebView.kt`，支持 `loadPage(route)` / `unloadPage(route)` 方法
- [x] 6.5 修改 `QuickJsEngine.kt`，支持每页面独立 JSContext（或复用单实例按需注入）

## 7. iOS SDK — WebView 池

- [x] 7.1 创建 `sdk/ios/.../PageWebViewPool.swift`
- [x] 7.2 实现 `acquire(route: String) -> DuallerWebView`
- [x] 7.3 实现 `release(webView: DuallerWebView)`
- [x] 7.4 实现 LRU 淘汰策略
- [x] 7.5 添加 `maxCacheSize` 配置项（默认 5）

## 8. iOS SDK — Engine 集成

- [x] 8.1 修改 `sdk/ios/.../DuallerEngine.swift`，将单例 WebView 改为池化
- [x] 8.2 `init()` 中创建 `PageWebViewPool` 实例
- [x] 8.3 `DuallerEngineInstance` 新增 `pool: PageWebViewPool` 字段
- [x] 8.4 修改 `DuallerWebView.swift`，支持 `loadPage(route)` / `unloadPage(route)`
- [x] 8.5 修改 `JSContextEngine.swift`，支持每页面独立 JSContext

## 9. 示例和模板更新

- [x] 9.1 更新 `examples/hello-world/` 构建验证（运行 `dualler build` 检查产物）
- [x] 9.2 更新 `examples/todo-list/` 构建验证
- [x] 9.3 更新 CLI 模板中的 `dualler.config.ts`（如有需要）
- [x] 9.4 验证 Android test app 能加载新的产物格式
- [x] 9.5 验证 iOS test app 能加载新的产物格式

## 10. 文档更新

- [x] 10.1 更新 `docs/getting-started.md`，添加 `App()` 使用示例
- [x] 10.2 更新 `docs/sdk-api.md`，说明 WebView 池配置
- [x] 10.3 在 `proposal.md` 的 Capabilities 中标记已完成的能力
