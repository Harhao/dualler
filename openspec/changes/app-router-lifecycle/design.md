## Why

当前 Dualler CLI 编译产物使用固定名称 `bundle.js` / `style.css`，无法与微信小程序的文件命名规范对齐。运行时层缺少 `App()` API 和页面级生命周期管理，Router 仅负责路由表维护，不管理 WebView 的创建/销毁。这导致 SDK 端无法实现 WebView 池等内存优化策略。

## What Changes (v1 Scope)

- **CLI 编译产物重命名**：每个页面输出 `{pageName}.js` / `{pageName}.css`，根目录输出 `app.js` / `app.css`
- **新增 `App()` API**：注册全局配置（类似微信小程序 `App()`），初始化页面栈
- **新增 Router 页面生命周期管理**：`loadPage()` / `unloadPage()` 控制页面 bundle 和 CSS 的加载/卸载
- **Router 集成 WebView 生命周期**：`navigateTo` / `navigateBack` / `switchTab` 触发 WebView 创建/回收
- **SDK 层 WebView 池抽象**：Android/iOS 均支持 `PageWebViewPool`，按需创建和复用 WebView

## v1 vs v2 范围划分

**v1（本 change）** — 打通基建链路：能编译、能注册 App、能路由、WebView 池化复用。
**v2（后续 change）** — 全面对齐微信小程序 API：

- 路由回调体系（success/fail/complete）
- tabBar 完整配置（midButton、iconPath、position 等）
- window 全局配置的 20+ 字段补全
- Component behaviors / relations / observers 路径表达式
- setData 高级语义（嵌套路径、函数式更新、自动 diff）
- 应用级 onError / onUnhandledPromiseRejection 接入
- subpackages 分包加载
- 页面间 eventChannel
- 更多页面生命周期钩子（onReady、onPageScroll、onTabItemTap、onSaveExitState）

v1 完成后小程序基本能跑，只是缺少回调、tabBar、高级 setData 等。v2 在此基础上补齐 API。

## Capabilities

### New Capabilities (All Completed)
- [x] `app-api`: App() 全局配置注册、页面栈管理、生命周期钩子
- [x] `page-lifecycle`: 页面级 load/unload、bundle 动态加载、CSS 注入/移除
- [x] `webview-pool`: WebView 池管理、按需创建、空闲回收、Android/iOS 对称实现

### Modified Capabilities
<!-- None — no existing specs to delta against -->

## Impact

- **CLI**：`packages/dualler-cli/src/commands/build.ts` — 输出命名策略变更
- **Runtime**：`packages/dualler-runtime-core/src/` — 新增 app.ts、loader.ts，修改 router.ts
- **Android SDK**：`sdk/android/` — 新增 WebView 池，修改 Engine/View/Adapter
- **iOS SDK**：`sdk/ios/` — 对称修改 Android SDK
- **Breaking**：编译产物路径变化，旧版 SDK 不兼容新的输出格式；需要配套升级
