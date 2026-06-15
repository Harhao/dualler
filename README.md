# Dualler — 小程序引擎

> 基于 Kotlin Multiplatform 的小程序引擎 SDK，让宿主 App 能够运行基于 Vue3 开发的小程序。

## 项目概述

Dualler 采用双线程架构，将 Vue3 代码编译分离为逻辑层（JS）和渲染层（HTML/CSS），通过 QuickJS 和 WebView 分别执行，由 Kotlin Native Bridge 统一调度。

### 核心特性

- 🚀 **高性能**：双线程隔离，逻辑层和渲染层并行执行
- 📦 **轻量级**：QuickJS 引擎体积小（~200KB），嵌入方便
- 🔒 **安全**：沙箱隔离，小程序代码无法访问宿主环境
- 🌐 **跨平台**：Android + iOS + Web，基于 Kotlin Multiplatform
- 📲 **增量更新**：支持 Bsdiff 字节级差量更新，节省 80%+ 流量

---

## 项目结构

```
dualler/
├── packages/
│   ├── platform-kmp/          # 共享接口层（Platform/JSEngine/WebView/Bridge）
│   ├── core-kmp/              # 共享运行时（AppRuntime/Router/DataChannel/包管理/错误处理）
│   ├── android/               # Android SDK（QuickJS/WebView/Bridge/API）
│   ├── ios/                   # iOS SDK（预留）
│   ├── web/                   # Web 平台（预留）
│   ├── shared/                # 前后端共享类型
│   ├── server/                # NestJS 后端服务
│   ├── admin/                 # Vue3 管理后台
│   ├── compiler/              # Vue3 SFC 编译器
│   └── gradle-plugin/         # Gradle 构建插件
├── docs/
│   ├── sdd/                   # 软件详细设计文档
│   └── superpowers/           # 实施计划
├── settings.gradle.kts        # Gradle 配置
└── build.gradle.kts           # 根构建脚本
```

---

## 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| **JDK** | 17+ | Kotlin/Android 编译 |
| **Gradle** | 8.5 | 构建工具（已内置 wrapper） |
| **Node.js** | 18+ | TypeScript/前端构建 |
| **npm** | 9+ | 包管理 |
| **Android Studio** | 2023+ | Android 开发（可选） |

---

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd dualler
```

### 2. 构建客户端 SDK（Kotlin Multiplatform）

```bash
# 构建所有 KMP 模块
./gradlew build

# 仅构建 platform-kmp
./gradlew :platform-kmp:build

# 仅构建 core-kmp
./gradlew :core-kmp:build

# 构建 Android SDK
./gradlew :android:build

# 运行单元测试
./gradlew :core-kmp:testDebugUnitTest
```

### 3. 构建编译器（TypeScript）

```bash
cd packages/compiler

# 安装依赖
npm install

# 构建
npm run build

# 使用编译器
node dist/cli.js build \
  --appId com.example.myapp \
  --pages src/pages/index.vue,src/pages/detail.vue \
  --outputDir dist
```

### 4. 启动服务端（NestJS）

```bash
cd packages/server

# 安装依赖
npm install

# 开发模式启动
npm run start:dev

# 服务默认运行在 http://localhost:3000
```

**API 端点：**

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/auth/login | 登录 |
| GET | /api/v1/apps | 小程序列表 |
| POST | /api/v1/apps | 创建小程序 |
| POST | /api/v1/packages/upload | 上传包 |
| GET | /api/v1/packages/:appId/check | 检查更新 |

### 5. 启动管理后台（Vue3）

```bash
cd packages/admin

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 访问 http://localhost:5173
# 默认账号：admin / admin
```

### 6. 构建 Gradle 插件

```bash
./gradlew :gradle-plugin:build

# 插件 JAR 位于
# packages/gradle-plugin/build/libs/gradle-plugin-1.0.0.jar
```

---

## Android 集成

### 添加依赖

```kotlin
// settings.gradle.kts
include(":platform-kmp")
include(":core-kmp")

// app/build.gradle.kts
dependencies {
    implementation(project(":core-kmp"))
    implementation(project(":platform-kmp"))
}
```

### 初始化 SDK

```kotlin
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
```

### 启动小程序

```kotlin
class MainActivity : AppCompatActivity() {
    private val dualler = DuallerSDK.getInstance()

    fun openMiniProgram(appId: String) {
        lifecycleScope.launch {
            dualler.launchApp("/path/to/package.mpkg")
        }
    }
}
```

---

## 小程序开发

### 目录结构

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

### app.json 配置

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
    "navigationBarBackgroundColor": "#000000"
  },
  "domainWhitelist": {
    "request": ["https://api.example.com"]
  }
}
```

### 页面示例

```vue
<template>
  <view class="container">
    <text>{{ message }}</text>
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

<style>
.container {
  padding: 20rpx;
}
</style>
```

### 编译小程序

```bash
# 使用编译器
npx @dualler/compiler build \
  --appId com.example.myapp \
  --entry src/app.vue \
  --pages src/pages/index.vue,src/pages/detail.vue \
  --outputDir dist

# 或使用 Gradle 插件
./gradlew compileDualler
```

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    小程序应用 (.mpkg)                      │
│               Vue3 SFC → 编译产物（JS + HTML + CSS）       │
└───────────────────────────────┬─────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────┐
│                    Framework Layer（框架层）               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ @dualler/     │  │ @dualler/    │  │ @dualler/    │  │
│  │ compiler      │  │ core         │  │ devtools     │  │
│  │ Vue3 SFC 编译 │  │ 运行时核心    │  │ 开发调试     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────────┬─────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────┐
│                    Platform Layer（平台层）                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ @dualler/     │  │ @dualler/    │  │ @dualler/    │  │
│  │ android       │  │ ios          │  │ web          │  │
│  │ QuickJS       │  │ JSCore       │  │ Worker       │  │
│  │ WebView       │  │ WKWebView    │  │ Shadow DOM   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 文档

| 文档 | 说明 |
|------|------|
| [客户端 SDK SDD](docs/sdd/Dualler-Client-SDK-SDD.md) | 客户端详细设计 |
| [服务端 SDD](docs/sdd/Dualler-Server-SDD.md) | 服务端详细设计 |
| [工具链 SDD](docs/sdd/Dualler-Toolchain-SDD.md) | 工具链详细设计 |

---

## 开发指南

### 运行测试

```bash
# 运行所有测试
./gradlew test

# 运行 core-kmp 测试
./gradlew :core-kmp:testDebugUnitTest

# 运行 platform-kmp 测试
./gradlew :platform-kmp:testDebugUnitTest
```

### 代码规范

- Kotlin：遵循 Kotlin 官方编码规范
- TypeScript：使用 ESLint + Prettier
- Git：使用 Conventional Commits

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

---

## 常见问题

### Q: Gradle 构建失败？

```bash
# 清理缓存
./gradlew clean

# 重新构建
./gradlew build
```

### Q: npm install 权限错误？

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### Q: 如何添加新的系统 API？

1. 在 `platform-kmp` 中定义接口
2. 在 `android` 中实现 `APIHandler`
3. 在 `AndroidPlatformBridge` 中注册

---

## License

MIT
