# iOS Demo

Dualler 小程序引擎 iOS 演示应用。

## 配置依赖

### 方法 1: 通过 Xcode 添加 Package Dependency（推荐）

1. 打开 `DuallerDemo.xcodeproj`
2. 选择项目 → Package Dependencies
3. 点击 "+" 添加本地包：
   - 路径: `../../packages/ios`
   - 产品: `DuallerIOS`
4. 点击 "Add Package"

### 方法 2: 通过 Package.swift

在 `test/ios-demo/` 目录创建 `Package.swift`：

```swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "DuallerDemo",
    platforms: [.iOS(.v15)],
    dependencies: [
        .package(path: "../../packages/ios"),
    ],
    targets: [
        .executableTarget(
            name: "DuallerDemo",
            dependencies: ["DuallerIOS"],
            path: "DuallerDemo"
        ),
    ]
)
```

## 运行

1. 编译 example 小程序：
   ```bash
   cd packages/example
   node ../compiler/dist/cli.js build --outputDir ./dist
   ```

2. 复制编译产物到设备：
   ```bash
   # 模拟器
   xcrun simctl get_app_container booted com.dualler.demo data
   # 复制 dist/ 到 Documents/dualler/packages/com.example.dualler-demo/
   ```

3. 运行 Demo

## 使用 SDK

Demo 使用 SDK 的 `DuallerSDK` 启动小程序：

```swift
import DuallerIOS

// 启动小程序
DuallerSDK.shared.launchApp(appId: "com.example.dualler-demo", from: self)
```

## 功能

- ✅ showToast / showModal
- ✅ navigateTo / redirectTo / navigateBack / reLaunch
- ✅ getSystemInfo
- ✅ 页面栈管理
- ✅ setData（基础支持）
