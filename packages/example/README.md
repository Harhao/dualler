# Dualler 示例小程序

这是一个完整的 Dualler 小程序示例，展示了框架的主要功能。

## 功能特性

- ✅ Vue3 Composition API（ref、computed、watch）
- ✅ 事件处理（tap、input）
- ✅ 数据绑定（文本、属性）
- ✅ 列表渲染（v-for）
- ✅ 条件渲染（v-if）
- ✅ 自定义组件
- ✅ 页面导航（navigateTo、navigateBack）
- ✅ Toast/Modal 弹窗
- ✅ 本地存储（getStorageSync、setStorageSync）
- ✅ 网络请求（wx.request）
- ✅ 设备信息（wx.getSystemInfo）
- ✅ Worker 线程
- ✅ 分包配置
- ✅ 域名白名单

## 目录结构

```
example/
├── app.json                    # 应用配置
├── src/
│   ├── app.vue                 # 应用入口
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue       # 首页（计数器、待办、API 示例）
│   │   ├── detail/
│   │   │   └── detail.vue      # 详情页（表单、图片、同层渲染）
│   │   └── profile/
│   │       └── profile.vue     # 个人页（存储、网络、Worker）
│   └── components/
│       └── Counter.vue         # 自定义计数器组件
└── workers/
    └── sort.js                 # Worker 脚本示例
```

---

## 🚀 运行方式

### 方式 1：使用编译器 CLI

```bash
# 1. 进入编译器目录
cd packages/compiler

# 2. 安装依赖并构建
npm install && npm run build

# 3. 编译示例小程序
node dist/cli.js build \
  --appId com.example.dualler-demo \
  --entry ../example/src/app.vue \
  --pages ../example/src/pages/index/index.vue,../example/src/pages/detail/detail.vue,../example/src/pages/profile/profile.vue \
  --outputDir ../example/dist

# 4. 查看编译产物
ls -la ../example/dist/
```

### 方式 2：使用 Gradle 插件

```bash
# 在项目根目录执行
./gradlew compileDualler
```

### 方式 3：在 Android 设备上运行

```bash
# 1. 构建 Android SDK
./gradlew :android:assembleDebug

# 2. 安装到设备
adb install packages/android/build/outputs/apk/debug/android-debug.apk

# 3. 推送小程序包到设备
adb push packages/example/dist/ /sdcard/dualler/packages/com.example.dualler-demo/

# 4. 启动小程序
adb shell am start -n com.dualler.android/.DuallerActivity \
  --es appId com.example.dualler-demo
```

### 方式 4：在浏览器中预览（Web 平台）

```bash
# 1. 构建 Web 平台
cd packages/web
npm install && npm run build

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器中打开
open http://localhost:5173
```

---

## 📦 编译产物

编译完成后，`dist/` 目录结构如下：

```
dist/
├── app.js                    # 应用入口
├── app.json                  # 应用配置
├── manifest.json             # 编译清单
├── chunks/
│   ├── runtime.js            # Dualler 运行时
│   └── vue.runtime.js        # Vue3 运行时
└── pages/
    ├── index/
    │   ├── index.js          # 首页逻辑
    │   ├── index.html        # 首页模板
    │   └── index.css         # 首页样式
    ├── detail/
    │   ├── detail.js
    │   ├── detail.html
    │   └── detail.css
    └── profile/
        ├── profile.js
        ├── profile.html
        └── profile.css
```

---

## 📱 页面说明

### 首页（index）

| 功能 | 说明 |
|------|------|
| 计数器 | 演示 ref 响应式数据和事件处理 |
| 待办事项 | 演示列表渲染、条件渲染、表单输入 |
| API 示例 | 演示 Toast、设备信息、页面跳转 |

### 详情页（detail）

| 功能 | 说明 |
|------|------|
| 图片网格 | 演示图片组件和 mode 属性 |
| 表单 | 演示输入框、文本域、表单提交 |
| 同层渲染占位 | 演示 video/map 原生组件 |

### 个人页（profile）

| 功能 | 说明 |
|------|------|
| 本地存储 | 演示 getStorageSync/setStorageSync |
| 网络请求 | 演示 wx.request |
| Worker 测试 | 演示 CPU 密集计算 |
| 弹窗示例 | 演示 wx.showModal |

---

## 🧩 自定义组件

### Counter 组件

```vue
<template>
  <Counter label="数量" :initialValue="0" :min="0" :max="100" @update="onUpdate" />
</template>

<script setup>
import Counter from '@/components/Counter.vue'

function onUpdate(value) {
  console.log('计数器更新:', value)
}
</script>
```

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | String | '计数器' | 显示标签 |
| initialValue | Number | 0 | 初始值 |
| min | Number | -Infinity | 最小值 |
| max | Number | Infinity | 最大值 |

**Events：**

| 事件 | 参数 | 说明 |
|------|------|------|
| update | Number | 值变化时触发 |

---

## ⚙️ 配置说明

### app.json 完整配置

```json
{
  "appId": "com.example.dualler-demo",
  "appName": "Dualler 示例",
  "version": "1.0.0",
  "pages": [
    "pages/index/index",
    "pages/detail/detail",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarBackgroundColor": "#1a73e8",
    "navigationBarTitleText": "Dualler 示例",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1a73e8",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的"
      }
    ]
  },
  "subpackages": [
    {
      "root": "packageShop",
      "name": "shop",
      "pages": ["pages/list/list", "pages/detail/detail"]
    }
  ],
  "domainWhitelist": {
    "request": [
      "https://api.example.com",
      "https://*.cdn.example.com"
    ]
  }
}
```

---

## ⚠️ 注意事项

1. **域名白名单**：所有网络请求必须在白名单域名内
2. **rpx 单位**：自动转换为 vw 视口单位
3. **Worker 限制**：Worker 脚本不能调用 wx.* API，不能访问 DOM
4. **同层渲染**：video/map 组件需要原生支持
5. **包大小限制**：主包不超过 2MB，单个子包不超过 2MB

---

## 🔧 开发调试

```bash
# 启动 DevTools（连接调试）
# 在 Android 代码中调用：
val devTools = DevToolsServer()
devTools.start(port = 9222)

# 然后在 Chrome 中打开：
# chrome://inspect
```

---

## 📚 相关文档

- [客户端 SDK SDD](../../docs/archive/sdd/Dualler-Client-SDK-SDD.md)
- [技术设计文档](../../2026-06-06-dualler-mini-program-engine-design.md)
- [项目 README](../../README.md)
