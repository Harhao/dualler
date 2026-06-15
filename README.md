<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="version">
  <img src="https://img.shields.io/badge/kotlin-1.9.22-purple" alt="kotlin">
  <img src="https://img.shields.io/badge/vue-3.4-green" alt="vue">
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="license">
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-brightgreen" alt="platform">
</p>

<h1 align="center">Dualler</h1>

<p align="center">
  <strong>高性能小程序引擎 SDK</strong><br>
  基于 Kotlin Multiplatform + Vue3，让宿主 App 能够运行轻量级小程序
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
  - [克隆项目](#1-克隆项目)
  - [构建客户端 SDK](#2-构建客户端-sdk)
  - [启动服务端](#3-启动服务端)
  - [启动管理后台](#4-启动管理后台)
  - [使用编译器](#5-使用编译器)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
  - [Android 集成](#android-集成)
  - [小程序开发](#小程序开发)
  - [运行测试](#运行测试)
  - [代码规范](#代码规范)
- [API 文档](#-api-文档)
- [部署指南](#-部署指南)
- [常见问题](#-常见问题)
- [设计文档](#-设计文档)
- [License](#-license)

---

## 🚀 核心特性

<table>
  <tr>
    <td width="50%">
      <h3>⚡ 高性能双线程架构</h3>
      <p>逻辑层（QuickJS）与渲染层（WebView）并行执行，WebMessagePort 非阻塞通信，16ms 批量合并 setData</p>
    </td>
    <td width="50%">
      <h3>🔒 企业级安全沙箱</h3>
      <p>QuickJS 剔除 std/os、锁定 Bridge、禁用 eval；虚拟域名资源隔离，断绝 file:// 逃逸</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🌐 Kotlin Multiplatform 跨平台</h3>
      <p>核心逻辑 100% 共享，Android/iOS/Web 三平台一套代码</p>
    </td>
    <td>
      <h3>📦 智能包管理</h3>
      <p>Bsdiff 字节级增量更新，节省 80%+ 流量；分包加载，主包 2MB + 子包按需</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🎬 同层渲染</h3>
      <p>video/map 等原生组件动态挂载到 WebView，滚动同步，原生体验</p>
    </td>
    <td>
      <h3>🛠 完整工具链</h3>
      <p>Vue3 SFC 编译器 + Gradle 插件 + DevTools 调试工具 + 管理后台</p>
    </td>
  </tr>
</table>

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
| **npm** | 9+ | 包管理 |
| **Android Studio** | 2023+ | Android 开发（可选） |

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-org/dualler.git
cd dualler
```

### 2. 构建客户端 SDK

```bash
# 构建所有模块（约 30 秒）
./gradlew build

# 仅运行测试
./gradlew :core-kmp:testDebugUnitTest

# 构建 Android APK
./gradlew :android:assembleDebug
```

<details>
<summary>📦 单独构建各模块</summary>

```bash
# 平台接口层
./gradlew :platform-kmp:build

# 运行时核心
./gradlew :core-kmp:build

# Android SDK
./gradlew :android:build

# iOS SDK
./gradlew :ios:compileKotlinIosArm64

# Web 平台
./gradlew :web:compileKotlinJs

# Gradle 插件
./gradlew :gradle-plugin:build
```

</details>

### 3. 启动服务端

```bash
cd packages/server

# 安装依赖
npm install

# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build && npm run start:prod
```

服务启动后访问：
- API：http://localhost:3000/api/v1
- 健康检查：http://localhost:3000/api/v1/health

### 4. 启动管理后台

```bash
cd packages/admin

# 安装依赖
npm install

# 开发模式
npm run dev
```

访问 http://localhost:5173，使用默认账号登录：
- 用户名：`admin`
- 密码：`admin`

### 5. 使用编译器

```bash
cd packages/compiler

# 安装依赖并构建
npm install && npm run build

# 编译小程序
node dist/cli.js build \
  --appId com.example.myapp \
  --entry src/app.vue \
  --pages src/pages/index.vue,src/pages/detail.vue \
  --outputDir dist

# 查看帮助
node dist/cli.js --help
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
│   │       ├── androidMain/       # Android expect 实现
│   │       ├── iosMain/           # iOS expect 实现
│   │       └── jsMain/            # Web expect 实现
│   │
│   ├── core-kmp/                  # 共享运行时
│   │   └── src/
│   │       ├── commonMain/
│   │       │   ├── AppRuntime.kt          # 应用生命周期
│   │       │   ├── Router.kt              # 页面路由
│   │       │   ├── DataChannel.kt         # 数据同步
│   │       │   ├── PageDataStore.kt       # 首屏缓存
│   │       │   ├── package/               # 包管理
│   │       │   ├── error/                 # 错误处理
│   │       │   ├── worker/                # Worker 线程
│   │       │   ├── component/             # 虚拟列表
│   │       │   └── devtools/              # DevTools
│   │       └── commonTest/        # 单元测试
│   │
│   ├── android/                   # Android SDK
│   │   └── src/main/kotlin/
│   │       ├── DuallerSDK.kt             # SDK 入口
│   │       ├── AndroidPlatform.kt        # 平台实现
│   │       ├── engine/                   # QuickJS 引擎
│   │       ├── webview/                  # WebView 容器
│   │       ├── bridge/                   # Bridge 通信
│   │       ├── api/                      # 系统 API
│   │       ├── samelayer/                # 同层渲染
│   │       ├── worker/                   # Worker 实现
│   │       ├── component/                # 虚拟列表
│   │       └── devtools/                 # DevTools
│   │
│   ├── ios/                       # iOS SDK（预留）
│   └── web/                       # Web 平台（预留）
│   │
│   │ ──── 服务端（TypeScript）────
│   │
│   ├── shared/                    # 共享类型
│   │   └── src/
│   │       ├── types/             # 类型定义
│   │       ├── constants/         # 常量
│   │       └── utils/             # 工具函数
│   │
│   ├── server/                    # NestJS 后端
│   │   └── src/
│   │       ├── auth/              # 认证模块
│   │       ├── user/              # 用户模块
│   │       ├── app/               # 小程序管理
│   │       ├── package/           # 包管理
│   │       ├── release/           # 发布管理
│   │       ├── distribution/      # 分发服务
│   │       ├── storage/           # 文件存储
│   │       ├── cdn/               # CDN 管理
│   │       └── statistics/        # 统计分析
│   │
│   ├── admin/                     # Vue3 管理后台
│   │   └── src/
│   │       ├── views/             # 页面
│   │       ├── stores/            # Pinia 状态
│   │       ├── api/               # API 封装
│   │       └── components/        # 组件
│   │
│   │ ──── 工具链（TypeScript/Kotlin）────
│   │
│   ├── compiler/                  # Vue3 SFC 编译器
│   │   └── src/
│   │       ├── parser/            # SFC 解析器
│   │       ├── bundler/           # 打包器
│   │       └── cli.ts             # CLI 入口
│   │
│   └── gradle-plugin/             # Gradle 插件
│       └── src/main/kotlin/
│           └── com/dualler/plugin/
│
├── docs/
│   ├── sdd/                       # 软件设计文档
│   │   ├── Dualler-Client-SDK-SDD.md
│   │   ├── Dualler-Server-SDD.md
│   │   └── Dualler-Toolchain-SDD.md
│   └── superpowers/               # 实施计划
│
├── build.gradle.kts               # 根构建脚本
├── settings.gradle.kts            # Gradle 配置
└── gradle.properties              # Gradle 属性
```

---

## 📖 开发指南

### Android 集成

#### 1. 添加依赖

```kotlin
// settings.gradle.kts
include(":platform-kmp")
include(":core-kmp")

// app/build.gradle.kts
dependencies {
    implementation(project(":core-kmp"))
    implementation(project(":platform-kmp"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
}
```

#### 2. 初始化 SDK

```kotlin
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        DuallerSDK.init(this, DuallerConfig(
            debug = BuildConfig.DEBUG,
            maxPages = 10,
            jsHeapSizeMB = 64,
            maxCacheSizeMB = 200,
            keepVersions = 2
        ))
    }
}
```

#### 3. 启动小程序

```kotlin
class MainActivity : AppCompatActivity() {
    private val dualler = DuallerSDK.getInstance()

    fun openMiniProgram(appId: String) {
        lifecycleScope.launch {
            // 方式 1：从本地路径启动
            dualler.launchApp("/path/to/package.mpkg")

            // 方式 2：检查更新后启动
            dualler.launchWithUpdate(
                appId = appId,
                serverApi = MyServerApi(),
                activity = this@MainActivity,
                callback = object : PackageCallback {
                    override fun onProgress(appId: String, progress: Int) {
                        progressBar.progress = progress
                    }
                    override fun onSuccess(appId: String, pkg: LocalPackage) {
                        // 启动成功
                    }
                    override fun onFailed(appId: String, error: PackageError) {
                        Toast.makeText(this@MainActivity, error.message, Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }
    }
}
```

### 小程序开发

#### 目录结构

```
my-miniapp/
├── app.vue              # 应用入口
├── app.json             # 应用配置
└── pages/
    ├── index/
    │   ├── index.vue    # 首页
    │   └── index.json   # 页面配置
    └── detail/
        ├── detail.vue   # 详情页
        └── detail.json
```

#### app.json 配置

```json
{
  "appId": "com.example.myapp",
  "appName": "我的小程序",
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "window": {
    "navigationBarTitleText": "我的小程序",
    "navigationBarBackgroundColor": "#000000",
    "navigationBarTextStyle": "white"
  },
  "subpackages": [
    {
      "root": "packageShop",
      "name": "shop",
      "pages": ["pages/list/list", "pages/detail/detail"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["shop"]
    }
  },
  "domainWhitelist": {
    "request": ["https://api.example.com"],
    "websocket": ["wss://ws.example.com"]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "用于获取您的位置信息"
    }
  }
}
```

#### 页面示例

```vue
<template>
  <view class="container">
    <text class="title">{{ message }}</text>
    <button @tap="handleClick">点击我</button>

    <!-- 虚拟列表（长列表优化） -->
    <recycle-view :list="items" :item-height="100">
      <template #item="{ item }">
        <view class="list-item">{{ item.name }}</view>
      </template>
    </recycle-view>

    <!-- WXS 视图层脚本（零 Bridge 开销） -->
    <wxs module="utils">
      function formatPrice(price) {
        return '¥' + price.toFixed(2);
      }
      module.exports = { formatPrice: formatPrice };
    </wxs>
    <text>{{ utils.formatPrice(item.price) }}</text>

    <!-- 同层渲染（原生组件） -->
    <video src="..." autoplay></video>
    <map longitude="116.46" latitude="39.92"></map>
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

#### Worker 使用

```javascript
// 创建 Worker
const worker = wx.createWorker('workers/sort.js')

// 发送数据
worker.postMessage({
  type: 'sort',
  data: largeArray,
  field: 'name'
})

// 接收结果
worker.onMessage(function(res) {
  console.log('排序结果:', res.sorted)
})

// 销毁 Worker
worker.terminate()
```

### 运行测试

```bash
# 运行所有测试
./gradlew test

# 运行 core-kmp 测试
./gradlew :core-kmp:testDebugUnitTest

# 运行 platform-kmp 测试
./gradlew :platform-kmp:testDebugUnitTest

# 运行 Android 测试
./gradlew :android:testDebugUnitTest

# 查看测试报告
open packages/core-kmp/build/reports/tests/testDebugUnitTest/index.html
```

### 代码规范

#### Kotlin

```bash
# 使用 ktlint 检查
./gradlew ktlintCheck

# 自动修复
./gradlew ktlintFormat
```

#### TypeScript

```bash
cd packages/server  # 或 packages/admin

# ESLint 检查
npm run lint

# 自动修复
npm run lint:fix

# Prettier 格式化
npm run format
```

#### Git 提交规范

```
<type>(<scope>): <subject>

类型：
  feat:     新功能
  fix:      修复 bug
  docs:     文档更新
  style:    代码格式调整
  refactor: 重构
  test:     测试相关
  chore:    构建/工具相关

示例：
  feat(android): add same-layer rendering for video component
  fix(core): resolve white-screen race condition in PageDataStore
  docs(sdd): update client SDK design document
```

---

## 📚 API 文档

### 服务端 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 登录 | ❌ |
| POST | `/api/v1/auth/register` | 注册 | ❌ |
| GET | `/api/v1/apps` | 小程序列表 | ✅ |
| POST | `/api/v1/apps` | 创建小程序 | ✅ |
| GET | `/api/v1/apps/:id` | 小程序详情 | ✅ |
| POST | `/api/v1/packages/upload` | 上传包 | ✅ |
| GET | `/api/v1/packages/:appId/check` | 检查更新 | ❌ |
| PUT | `/api/v1/packages/:id/publish` | 发布 | ✅ |
| PUT | `/api/v1/packages/:id/gray` | 灰度配置 | ✅ |
| GET | `/api/v1/statistics/overview` | 统计概览 | ✅ |

### 小程序 API (wx.*)

| API | 说明 | 异步 |
|-----|------|------|
| `wx.request` | HTTP 请求 | ✅ |
| `wx.getStorageSync` | 同步读取存储 | ❌ |
| `wx.setStorageSync` | 同步写入存储 | ❌ |
| `wx.navigateTo` | 跳转页面 | ❌ |
| `wx.navigateBack` | 返回上一页 | ❌ |
| `wx.showToast` | 显示提示 | ❌ |
| `wx.showModal` | 显示弹窗 | ✅ |
| `wx.getSystemInfo` | 获取设备信息 | ✅ |
| `wx.createWorker` | 创建 Worker | ❌ |

---

## 🚢 部署指南

### 服务端部署

```bash
# 构建
cd packages/server
npm run build

# Docker 部署
docker build -t dualler-server .
docker run -p 3000:3000 dualler-server

# PM2 部署
pm2 start dist/main.js --name dualler-server
```

### 管理后台部署

```bash
cd packages/admin
npm run build

# 部署到 Nginx
cp -r dist/* /var/www/admin/
```

### 环境变量

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/dualler
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
STORAGE_PROVIDER=oss  # local | oss | s3
CDN_PROVIDER=aliyun   # aliyun | tencent | qiniu
```

---

## ❓ 常见问题

<details>
<summary><strong>Q: Gradle 构建失败怎么办？</strong></summary>

```bash
# 清理缓存
./gradlew clean

# 删除 Gradle 缓存
rm -rf ~/.gradle/caches

# 重新构建
./gradlew build --refresh-dependencies
```

</details>

<details>
<summary><strong>Q: npm install 权限错误？</strong></summary>

```bash
# 修复 npm 权限
sudo chown -R $(whoami) ~/.npm

# 或使用 nvm 管理 Node.js
nvm install 18
nvm use 18
npm install
```

</details>

<details>
<summary><strong>Q: 如何添加新的系统 API？</strong></summary>

1. 在 `platform-kmp/src/commonMain` 中定义接口
2. 在 `android/src/main` 中实现 `APIHandler`
3. 在 `AndroidPlatformBridge` 中注册

```kotlin
// 1. 定义接口
interface MyAPIHandler : APIHandler

// 2. 实现
class MyAPIHandlerImpl : MyAPIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        // 实现逻辑
        callback(APIResult.Success(mapOf("result" to "ok")))
    }
}

// 3. 注册
bridge.registerAPI("myApi", MyAPIHandlerImpl())
```

</details>

<details>
<summary><strong>Q: 如何调试小程序？</strong></summary>

1. 启动 DevTools 服务器
2. 使用 Chrome DevTools 连接
3. 查看 Console、Network、Components 面板

```kotlin
// 启动 DevTools
val devTools = DevToolsServer()
devTools.start(port = 9222)
```

</details>

---

## 📄 设计文档

| 文档 | 说明 |
|------|------|
| [客户端 SDK SDD](docs/sdd/Dualler-Client-SDK-SDD.md) | 客户端详细设计（platform/core/android） |
| [服务端 SDD](docs/sdd/Dualler-Server-SDD.md) | 服务端详细设计（server/admin） |
| [工具链 SDD](docs/sdd/Dualler-Toolchain-SDD.md) | 工具链详细设计（compiler/gradle-plugin） |
| [技术设计文档](2026-06-06-dualler-mini-program-engine-design.md) | 总体技术设计 |

---

## 📊 项目统计

| 指标 | 数量 |
|------|------|
| 模块数 | 10 |
| Kotlin 文件 | 60+ |
| TypeScript 文件 | 100+ |
| Vue 文件 | 15+ |
| 测试用例 | 10+ |
| 构建任务 | 359 |

---

## 🤝 Contributing

欢迎贡献代码！请遵循以下流程：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📝 License

MIT License © 2026 [Your Name/Org]

---

<p align="center">
  Made with ❤️ by Dualler Team
</p>
