<h1 align="center">Dualler</h1>

<p align="center">
  <strong>高性能小程序引擎 SDK</strong><br>
  基于 Kotlin Multiplatform + Vue3，让宿主 App 能够运行轻量级小程序
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="version">
  <img src="https://img.shields.io/badge/kotlin-1.9.22-purple" alt="kotlin">
  <img src="https://img.shields.io/badge/vue-3.4-green" alt="vue">
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="license">
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-brightgreen" alt="platform">
</p>

<p align="center">
  <a href="#-核心特性">核心特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-开发指南">开发指南</a> •
  <a href="#-api-文档">API 文档</a> •
  <a href="#-常见问题">常见问题</a>
</p>

---

## 📖 目录

- [核心特性](#-核心特性)
- [技术架构](#-技术架构)
- [环境要求](#-环境要求)
- [快速开始](#-快速开始)
  - [构建客户端 SDK](#1-构建客户端-sdk)
  - [启动服务端](#2-启动服务端)
  - [启动管理后台](#3-启动管理后台)
  - [使用编译器](#4-使用编译器)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
  - [Android 集成](#android-集成)
  - [iOS 集成](#ios-集成)
  - [Web 集成](#web-集成)
  - [小程序开发](#小程序开发)
  - [运行测试](#运行测试)
- [API 文档](#-api-文档)
- [设计原则](#-设计原则)
- [常见问题](#-常见问题)
- [设计文档](#-设计文档)

---

## 🚀 核心特性

| 特性 | 说明 |
|------|------|
| ⚡ **双线程架构** | 逻辑层（QuickJS）与渲染层（WebView）并行执行 |
| 🔒 **安全沙箱** | JS 层同步拦截 + Native 异步校验 + HTTPS 强制 |
| 🌐 **跨平台** | Android (Kotlin) + iOS (Swift) + Web (TypeScript) |
| 📦 **增量更新** | Bsdiff 字节级差量，节省 80%+ 流量 |
| 📱 **分包加载** | 主包 2MB + 子包按需 + 预加载策略 |
| 🎬 **同层渲染** | video/map 等原生组件动态挂载 |
| 🧵 **Worker 线程** | CPU 密集计算卸载到独立线程 |
| 🛠 **完整工具链** | 编译器 + Gradle 插件 + DevTools + 管理后台 |

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                       小程序应用 (.mpkg)                          │
│               Vue3 SFC → 编译产物（JS + HTML + CSS）               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Framework Layer（框架层）                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ @dualler/     │  │ @dualler/    │  │ @dualler/              │  │
│  │ compiler      │  │ core         │  │ devtools               │  │
│  │ Vue3 SFC 编译 │  │ 运行时核心    │  │ 日志/网络/组件/性能      │  │
│  └──────────────┘  └──────────────┘  └────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Platform Layer（平台层）                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ @dualler/     │  │ @dualler/    │  │ @dualler/    │           │
│  │ android       │  │ ios          │  │ web          │           │
│  │ QuickJS       │  │ JSCore       │  │ Worker       │           │
│  │ WebView       │  │ WKWebView    │  │ Shadow DOM   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**数据流：**

```
Vue3 SFC → 编译器 → .mpkg 包
                      ↓
              AppRuntime 初始化
                      ↓
    ┌─────────────────┴─────────────────┐
    ↓                                   ↓
QuickJS (逻辑层)                   WebView (渲染层)
    │                                   │
    │  setData(json)                    │
    ├──────────────────────────────────→│  DOM 更新
    │                                   │
    │  event(json)                      │
    │←──────────────────────────────────┤  用户交互
    │                                   │
    │  callNative(api, params)          │
    ├──────────→ Native Bridge ────────→│  系统 API
```

---

## 💻 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| **JDK** | 17+ | Kotlin/Android 编译 |
| **Gradle** | 8.5 | 构建工具（已内置 wrapper） |
| **Node.js** | 18+ | TypeScript/前端构建 |
| **npm/pnpm** | 9+ | 包管理 |
| **Xcode** | 15+ | iOS 开发（仅 macOS） |
| **Android Studio** | 2023+ | Android 开发（可选） |

---

## 🚀 快速开始

### 1. 构建客户端 SDK

```bash
# 克隆项目
git clone https://github.com/harhao/dualler.git
cd dualler

# 构建所有 KMP 模块（Android + 共享层）
./gradlew build

# 运行测试
./gradlew :core-kmp:testDebugUnitTest
```

### 2. 启动服务端

```bash
cd packages/server

# 安装依赖
npm install

# 开发模式（热重载）
npm run start:dev

# 服务运行在 http://localhost:3000
```

### 3. 启动管理后台

```bash
cd packages/admin

# 安装依赖
npm install

# 开发模式
npm run dev

# 访问 http://localhost:5173
# 默认账号：admin / admin
```

### 4. 使用编译器

```bash
cd packages/compiler

# 安装依赖并构建
npm install && npm run build

# 编译小程序
node dist/cli.js build \
  --appId com.example.myapp \
  --pages src/pages/index.vue,src/pages/detail.vue \
  --outputDir dist
```

---

## 📁 项目结构

```
dualler/
├── packages/
│   │
│   │ ──── 客户端 SDK（Kotlin Multiplatform）────
│   │
│   ├── platform-kmp/              # 共享接口层
│   │   └── src/
│   │       ├── commonMain/        # Platform/JSEngine/WebView/Bridge 接口
│   │       ├── androidMain/       # Android 实现
│   │       ├── iosMain/           # iOS 实现
│   │       └── jsMain/            # Web 实现
│   │
│   ├── core-kmp/                  # 共享运行时
│   │   └── src/
│   │       ├── commonMain/        # AppRuntime/Router/DataChannel/包管理/错误处理
│   │       └── commonTest/        # 单元测试
│   │
│   ├── android/                   # Android SDK（Kotlin）
│   │   └── src/main/kotlin/
│   │       ├── engine/            # QuickJS 引擎
│   │       ├── webview/           # WebView 容器
│   │       ├── bridge/            # Bridge 通信
│   │       ├── api/               # 系统 API
│   │       ├── samelayer/         # 同层渲染
│   │       ├── worker/            # Worker 线程
│   │       ├── component/         # 虚拟列表
│   │       └── devtools/          # DevTools
│   │
│   │ ──── 原生平台实现 ────
│   │
│   ├── ios/                       # iOS SDK（Swift）
│   │   ├── Package.swift          # Swift Package Manager
│   │   └── Sources/DuallerIOS/
│   │       ├── Engine/            # JavaScriptCore 引擎
│   │       ├── WebView/           # WKWebView 容器
│   │       └── Bridge/            # 原生 Bridge
│   │
│   ├── web/                       # Web 平台（TypeScript）
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── engine/            # Web Worker 引擎
│   │       ├── webview/           # Shadow DOM 渲染
│   │       ├── bridge/            # postMessage 通信
│   │       └── api/               # 浏览器 API
│   │
│   │ ──── 服务端（TypeScript）────
│   │
│   ├── shared/                    # 共享类型
│   ├── server/                    # NestJS 后端
│   └── admin/                     # Vue3 管理后台
│   │
│   │ ──── 工具链（TypeScript/Kotlin）────
│   │
│   ├── compiler/                  # Vue3 SFC 编译器
│   └── gradle-plugin/             # Gradle 插件
│
├── docs/
│   └── sdd/                       # 软件设计文档
│       ├── Dualler-Client-SDK-SDD.md
│       ├── Dualler-Server-SDD.md
│       └── Dualler-Toolchain-SDD.md
│
├── build.gradle.kts               # 根构建脚本
├── settings.gradle.kts            # Gradle 配置
└── .gitignore
```

---

## 📖 开发指南

### Android 集成

```kotlin
// 1. 添加依赖（settings.gradle.kts）
include(":platform-kmp")
include(":core-kmp")

// 2. app/build.gradle.kts
dependencies {
    implementation(project(":core-kmp"))
    implementation(project(":platform-kmp"))
}

// 3. 初始化 SDK
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        DuallerSDK.init(this, DuallerConfig(
            debug = BuildConfig.DEBUG,
            maxPages = 10,
            jsHeapSizeMB = 64
        ))
    }
}

// 4. 启动小程序
lifecycleScope.launch {
    DuallerSDK.getInstance().launchApp("/path/to/package.mpkg")
}
```

### iOS 集成

```swift
// 1. 添加依赖（Package.swift）
dependencies: [
    .package(path: "../packages/ios")
]

// 2. 初始化
let context = ApplicationContext(
    viewController: self,
    configuration: .default
)
let platform = IOSPlatform(context: context)

// 3. 创建引擎
let jsEngine = platform.createJSEngine()
let webView = platform.createWebView()
let bridge = platform.createBridge()

// 4. 连接组件
bridge.connectEngine(jsEngine)
bridge.connectWebView(webView)

// 5. 加载小程序
webView.loadHtml(htmlContent, baseUrl: "https://dualler.local")
```

### Web 集成

```typescript
// 1. 安装依赖
// npm install @dualler/web

// 2. 初始化
import { WebPlatform } from '@dualler/web';

const platform = new WebPlatform();
const jsEngine = platform.createJSEngine();
const webView = platform.createWebView();
const bridge = platform.createBridge();

// 3. 挂载到 DOM
webView.mount('app-container');

// 4. 连接组件
bridge.connectEngine(jsEngine);
bridge.connectWebView(webView);

// 5. 加载小程序
webView.loadHtml(htmlContent);
```

### 小程序开发

```vue
<template>
  <view class="container">
    <text class="title">{{ message }}</text>
    <button @tap="handleClick">点击我</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Dualler!')

function handleClick() {
  message.value = '已点击'
  wx.showToast({ title: '提示' })
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}
.title {
  font-size: 32rpx;
  color: #333;
}
</style>
```

### 运行测试

```bash
# Gradle 测试（Android/共享层）
./gradlew :core-kmp:testDebugUnitTest
./gradlew :platform-kmp:testDebugUnitTest

# TypeScript 测试
cd packages/compiler && npm test
cd packages/server && npm test

# Swift 测试
cd packages/ios && swift test
```

---

## 📚 API 文档

### 服务端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/apps` | 小程序列表 |
| POST | `/api/v1/packages/upload` | 上传包 |
| GET | `/api/v1/packages/:appId/check` | 检查更新 |
| PUT | `/api/v1/packages/:id/publish` | 发布 |

### 小程序 API (wx.*)

| API | 说明 |
|-----|------|
| `wx.request` | HTTP 请求 |
| `wx.navigateTo` | 跳转页面 |
| `wx.navigateBack` | 返回上一页 |
| `wx.showToast` | 显示提示 |
| `wx.getSystemInfo` | 获取设备信息 |
| `wx.createWorker` | 创建 Worker |

---

## 🎯 设计原则

Dualler 遵循微信小程序的设计思想：

| 原则 | 说明 |
|------|------|
| **双线程隔离** | 逻辑层与渲染层分离，通过 Bridge 通信 |
| **安全沙箱** | 小程序代码无法访问宿主环境 |
| **组件化开发** | Vue3 SFC 组件，支持自定义组件 |
| **数据驱动** | setData 驱动视图更新，路径式更新优化 |
| **生命周期管理** | App/Page/Component 完整生命周期 |
| **分包加载** | 主包 + 子包，按需加载 |
| **增量更新** | 字节级差量更新，节省流量 |
| **同层渲染** | 原生组件覆盖渲染，原生体验 |
| **虚拟列表** | 长列表优化，DOM 节点回收 |
| **WXS 脚本** | 视图层脚本，零 Bridge 开销 |

---

## ❓ 常见问题

<details>
<summary><strong>Q: Gradle 构建失败？</strong></summary>

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```
</details>

<details>
<summary><strong>Q: npm install 权限错误？</strong></summary>

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```
</details>

<details>
<summary><strong>Q: 如何添加新的系统 API？</strong></summary>

1. 在 `platform-kmp` 中定义接口
2. 在对应平台实现 `APIHandler`
3. 在 Bridge 中注册
</details>

---

## 📄 设计文档

| 文档 | 说明 |
|------|------|
| [客户端 SDK SDD](docs/sdd/Dualler-Client-SDK-SDD.md) | 客户端详细设计 |
| [服务端 SDD](docs/sdd/Dualler-Server-SDD.md) | 服务端详细设计 |
| [工具链 SDD](docs/sdd/Dualler-Toolchain-SDD.md) | 工具链详细设计 |
| [技术设计文档](2026-06-06-dualler-mini-program-engine-design.md) | 总体技术设计 |

---

## 📊 项目统计

| 指标 | 数量 |
|------|------|
| 模块数 | 10 |
| Kotlin 文件 | 60+ |
| TypeScript 文件 | 100+ |
| Swift 文件 | 6 |
| 测试用例 | 10+ |

---

## 🤝 Contributing

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📝 License

MIT License © 2026

---

<p align="center">
  Made with ❤️ by Dualler Team
</p>
