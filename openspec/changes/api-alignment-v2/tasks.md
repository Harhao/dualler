## 1. 路由回调体系

- [ ] 1.1 修改 router.ts 的 `executeRoute`，为 navigateTo/redirectTo/reLaunch 添加 success/fail/complete 回调链
- [ ] 1.2 修改 navigateBack，success 回调传入返回目标页面的 options
- [ ] 1.3 添加页面栈 10 层上限检查，超出时调用 fail 回调
- [ ] 1.4 在 NavigateOptions 类型中补充 success/fail/complete 字段

## 2. tabBar 完整配置

- [ ] 2.1 在 dualler.config.ts 类型定义中新增 `tabBar` 配置接口
- [ ] 2.2 CLI 编译时识别 tabBar.list 中的页面标记为 tab 页
- [ ] 2.3 Android SDK 实现底部/顶部 tabBar 导航栏（midButton 支持）
- [ ] 2.4 iOS SDK 对称实现 tabBar 导航栏
- [ ] 2.5 switchTab 校验：非 tabBar 页面禁止跳转，tabBar 页面禁止带 query

## 3. window 全局配置补全

- [ ] 3.1 扩展 AppOptions.window 接口至 20+ 字段（navigationStyle、backgroundColor、safeArea 等）
- [ ] 3.2 CLI 编译时将 window 配置输出到 app.json 或等效元数据
- [ ] 3.3 SDK 读取 window 配置并应用到 WebView 宿主 Activity/ViewController

## 4. setData 高级语义

- [ ] 4.1 支持嵌套路径赋值 `this.setData({ 'a.b.c': value })`
- [ ] 4.2 支持函数式更新 `this.setData(state => ({ ... }))`
- [ ] 4.3 实现 setData 自动 diff + 异步批量合并
- [ ] 4.4 在 page.ts 中增强 reactiveData 的 path-aware setter

## 5. Component 增强

- [ ] 5.1 实现 behaviors 混入机制（共享 properties/data/methods）
- [ ] 5.2 实现 relations（父子组件自动关联）
- [ ] 5.3 实现 observers 路径表达式（`'a.b'` 级别监听）
- [ ] 5.4 补充 Component 生命周期 `created` / `moved`
- [ ] 5.5 实现 pageLifetimes（组件在页面中的 show/hide/resize）
- [ ] 5.6 实现 externalClasses（外部样式类）

## 6. 应用级生命周期接入

- [ ] 6.1 在 app.ts 中接入 onError 回调
- [ ] 6.2 在 app.ts 中接入 onUnhandledPromiseRejection 回调
- [ ] 6.3 接入 onPageNotFound / onThemeChange / onUserLibVersionChange

## 7. 分包加载 subpackages

- [ ] 7.1 在 config 中支持 subpackages 配置（root + pages）
- [ ] 7.2 CLI 编译时按 subpackages 拆分输出目录
- [ ] 7.3 运行时支持懒加载 subpackage bundle
- [ ] 7.4 实现 preloadRule 预下载规则

## 8. 页面间 eventChannel

- [ ] 8.1 navigateTo 支持通过 eventChannel 传递事件
- [ ] 8.2 目标页可通过 `getOpenerEventChannel()` 获取事件通道
- [ ] 8.3 实现 emit/on/off 事件 API

## 9. 页面生命周期钩子补全

- [ ] 9.1 实现 Page `onReady`（页面初次渲染完成）
- [ ] 9.2 实现 Page `onPageScroll`（页面滚动监听）
- [ ] 9.3 实现 Page `onTabItemTap`（Tab 项点击回调）
- [ ] 9.4 实现 Page `onSaveExitState`（保存退出状态）
- [ ] 9.5 实现 Page `onShareTimeline` / `onAddToFavorites`

## 10. getCurrentPages() 增强

- [ ] 10.1 返回页面实例数组而非纯字符串
- [ ] 10.2 每个实例包含 route、options、$page 等字段

## 11. 文档和示例更新

- [ ] 11.1 更新 docs/getting-started.md 补充所有新增 API 示例
- [ ] 11.2 更新 examples 验证所有新增功能
- [ ] 11.3 编写 API 对齐对照表（Dualler vs 微信）
