# Native SDK API Reference

This document describes the public APIs exposed by the Dualler native SDKs.

## iOS SDK

### Installation

Via Swift Package Manager, add:

```
.Package(url: "https://github.com/your-org/dualler", .upToNextMajor(from: "0.1.0"))
```

Or use the local path: `sdk/ios/`

### Initialization

```swift
import DuallerSDK

let bundleURL = Bundle.main.url(forResource: "index", withExtension: "js")!
let config = EngineConfig(
    debugMode: true,
    bundleURL: bundleURL,
    maxCacheSize: 5
)

let engine = try DuallerEngine.init(UIApplication.shared, config: config)
```

### EngineConfig

| Parameter     | Type       | Default | Description              |
|---------------|------------|---------|--------------------------|
| debugMode     | Bool       | false   | Enable debug logging     |
| bundleURL     | URL        | -       | Path to compiled bundle  |
| errorHandler  | Closure?   | nil     | Callback on fatal errors |
| maxCacheSize  | Int        | 5       | Max idle WebViews in pool|

### WebView Pool

Each engine instance includes a `PageWebViewPool` for per-page navigation:

```swift
let pool = engine.pool
let webView = try pool.acquire("pages/detail/detail")
// ... later ...
pool.release(webView, forRoute: "pages/detail/detail")
```

### Handler Registration

Native handlers expose standard APIs:

```swift
bridgeManager.register(DeviceHandler())
bridgeManager.register(StorageHandler())
bridgeManager.register(ToastHandler())
bridgeManager.register(NavigationHandler())
bridgeManager.register(FileSystemHandler())
bridgeManager.register(RequestHandler())
bridgeManager.register(MediaHandler())
bridgeManager.register(CanvasHandler())
```

### BridgeMessage Format

```swift
struct BridgeMessage: Codable {
    let type: MessageType      // patch | api_call | api_response | event
    let payload: [String: Any]?
    let callbackId: String?
    let timestamp: Int64
}
```

### MessageType Values

| Value | Description                          |
|-------|--------------------------------------|
| patch | DSL VNode patch instructions         |
| api_call | JS requesting a native API         |
| api_response | Response from a native handler |
| event   | Lifecycle or user interaction event  |

## Android SDK

### Installation

Add to `build.gradle.kts`:

```kotlin
dependencies {
    implementation(project(":sdk:shared"))
    implementation("com.dualler:sdk-android:0.1.0")
}
```

### Initialization

```kotlin
val bundleUrl = "file:///android_asset/dist/pages/index/index.js"
val config = EngineConfig(
    debugMode = true,
    bundleUrl = bundleUrl,
    maxCacheSize = 5
)

val engine = DuallerEngine.init(applicationContext, config)
```

### EngineConfig

| Parameter     | Type              | Default | Description              |
|---------------|-------------------|---------|--------------------------|
| debugMode     | Boolean           | false   | Enable debug logging     |
| bundleUrl     | String            | -       | Path to compiled bundle  |
| errorHandler  | ((Throwable)→Unit)? | nil   | Callback on fatal errors |
| maxCacheSize  | Int               | 5       | Max idle WebViews in pool|

### WebView Pool

```kotlin
val pool = engine.pool
val webView = pool.acquire("pages/detail/detail")
// ... later ...
pool.release("pages/detail/detail", webView)
```

### API Parity

Android exposes the same handler interfaces as iOS.
All `Handler` implementations in the shared module are identical between platforms.

## Supported Native APIs

| Category      | JS API                  | iOS Handler     | Android Handler   |
|---------------|-------------------------|-----------------|-------------------|
| Network       | `dualler.request`       | RequestHandler  | RequestHandler.kt |
| Storage       | `dualler.setStorageSync`| StorageHandler  | StorageHandler.kt |
| Toast         | `dualler.showToast`     | ToastHandler    | ToastHandler.kt   |
| Navigation    | `dualler.navigateTo`    | NavigationHandler| NavigationHandler.kt|
| File System   | `dualler.getFileSystemManager`| FileSystemHandler| FileSystemHandler.kt|
| Device        | `dualler.getSystemInfo` | DeviceHandler   | DeviceHandler.kt  |
| Canvas        | `dualler.createCanvasContext`| CanvasHandler| CanvasHandler.kt  |
| Media         | `dualler.chooseImage`   | MediaHandler    | MediaHandler.kt   |
