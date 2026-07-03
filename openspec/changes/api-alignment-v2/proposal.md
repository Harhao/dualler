## Context

v1 (`app-router-lifecycle`) 完成了编译产物命名、App() 基础 API、Loader、Router WebView 集成、SDK WebView 池等基建。小程序现在能跑基本的路由流程。

但距离真正对齐微信小程序还有很大差距：
- 路由没有 success/fail/complete 回调
- 没有 tabBar 支持
- window 配置只有 4 个字段
- setData 不支持嵌套路径、函数式更新
- Component 缺少 behaviors/relations/observers

## Goals

全面对齐微信小程序 API 设计，让 Dualler 的小程序在 API 层面尽可能兼容微信生态。

## Scope (tentative)

| 领域 | 内容 |
|------|------|
| 路由 | success/fail/complete 回调、页面栈 10 层上限、eventChannel |
| 配置 | tabBar 完整配置、window 20+ 字段 |
| 数据 | setData 嵌套路径、函数式更新、自动 diff |
| 组件 | behaviors、relations、observers 路径表达式、pageLifetimes |
| 应用 | onError、onUnhandledPromiseRejection 接入 App 生命周期 |
| 分包 | subpackages 配置 + 预下载规则 |
| 页面生命周期 | onReady、onPageScroll、onTabItemTap、onSaveExitState |

## Dependencies

- 依赖 `app-router-lifecycle` v1 先完成（CLI 命名 + App() + Loader + Router + WebView 池）

## Open Questions

1. setData 自动 diff 的性能开销如何控制？
2. subpackages 是否需要改编译器还是只做运行时加载？
3. eventChannel 如何与现有的 Page query 传参协调？
