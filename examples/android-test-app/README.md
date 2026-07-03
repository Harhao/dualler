# Android Test App

A minimal Android application that integrates the Dualler Android SDK for testing.

## Prerequisites

- Android Studio with SDK 21+
- JDK 8+

## Quick Start

```bash
# 1. Build the hello-world example
cd examples/hello-world
npx dualler build

# 2. Copy dist into Android assets
cp -r dist/* ../../examples/android-test-app/src/main/assets/dist/

# 3. Open in Android Studio and run
```

Or use the Gradle task:
```bash
./gradlew copyDistToAssets
```

## Structure

```
android-test-app/
├── build.gradle.kts              # App-level Gradle config with SDK dependency
├── settings.gradle.kts           # Includes sdk project in build
├── gradle.properties             # Build configuration
├── src/main/
│   ├── AndroidManifest.xml       # App manifest
│   ├── assets/dist/              # Compiled bundles (copied from hello-world)
│   │   ├── app.js
│   │   ├── app.css
│   │   └── pages/index/
│   │       ├── index.js
│   │       └── index.css
│   └── java/com/example/duallertest/
│       └── MainActivity.kt       # Entry point
```

## Architecture

1. `MainActivity` creates an `EngineConfig` pointing to `file:///android_asset/dist/pages/index/index.js`
2. `DuallerEngine.init()` creates a `DuallerWebView`, `BridgeManager`, and `PageWebViewPool`
3. `DuallerWebView` loads the bundle from assets and injects the JS bridge
4. The bundle registers a `Page()` with VNode render — the bridge handles native API calls

## WebView Pool

The engine includes an LRU-based `PageWebViewPool` (default max 5). Use `DuallerEngine.getPool()` to access it for programmatic navigation.
