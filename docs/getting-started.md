# Getting Started

This guide walks you through creating, building, and running your first Dualler mini-program.

## Prerequisites

- Node.js 18+
- npm or pnpm
- A mobile device or emulator (optional, for preview)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dualler.git
cd dualler

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Creating a Project

```bash
# Using the CLI
dualler create my-first-app

# Or manually
mkdir my-first-app && cd my-first-app
# Copy template files from packages/dualler-cli/src/commands/create/templates/basic/
```

This will start an interactive wizard that asks for:
1. Project name
2. Template selection (basic, todo-list, with-store)

## Project Structure

```
my-first-app/
├── dualler.config.ts       # Project configuration (aligned with WeChat app.json)
├── package.json
└── src/
    ├── App.vue             # Root component
    └── pages/
        └── index.vue       # Home page
```

### Configuration

`dualler.config.ts` is the main configuration file, aligned with WeChat's `app.json` design:

```ts
export default {
  appId: 'my-first-app',
  minPlatformVersion: 1,
  pages: [
    { path: 'pages/index', style: { navigationBarTitleText: 'My App' } }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'Dualler',
    navigationBarTextStyle: 'black',
  },
};
```

- `pages` — Route table, each page has a `path` and optional `style` (navigationBarTitleText, etc.)
- `window` — Global window appearance
- `appId` / `minPlatformVersion` — Build-time configuration

## App Initialization

Dualler provides an `App()` API for global initialization, similar to WeChat Mini Programs:

```ts
import { App, getApp } from '@dualler/runtime-core';

App({
  globalData: {
    theme: 'light',
    version: '1.0.0',
  },
  window: {
    navigationBarTitleText: 'My App',
    backgroundTextStyle: 'light',
  },
  onLaunch(options) {
    console.log('App launched!', options);
  },
  onShow() {
    console.log('App shown');
  },
  onHide() {
    console.log('App hidden');
  },
});

// Access global data from anywhere
const app = getApp<{ globalData: { theme: string } }>();
console.log(app.globalData.theme);
```

## Writing Your First Page

Create `src/pages/index.vue`:

```vue
<template>
  <view class="container">
    <text class="title">Hello, Dualler!</text>
    <button bindtap="sayHello">Click Me</button>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

function sayHello() {
  console.log('Button clicked!');
}

definePage({
  data: { greeting: 'Hello' },
  sayHello,
});
</script>

<style>
.container {
  padding: 40rpx;
  text-align: center;
}
.title {
  font-size: 48rpx;
  color: #333;
  margin-bottom: 20rpx;
}
</style>
```

## Building

```bash
dualler build
```

Output goes to `dist/`. Each page gets `{pageName}.js` (logic layer) and `{pageName}.css` (styles), plus `app.js` / `app.css` at the root — aligned with WeChat mini-program's file naming convention:

```
dist/
├── app.js              # Global JS (empty, for compatibility)
├── app.css             # Combined global styles
└── pages/
    └── index/
        ├── index.js    # Page logic layer
        └── index.css   # Page styles
```

| WeChat | Dualler |
|---|---|
| `pages/index/index.js` | `pages/index/index.js` |
| `pages/index/index.wxss` | `pages/index/index.css` |
| `app.json` | `dualler.config.ts` |

## Development Mode

```bash
dualler dev
```

Starts the dev server at `http://localhost:3000` with:
- File watching for `.vue` changes
- Incremental recompilation via `@dualler/compiler`
- WebSocket-based hot module replacement
- Bundle served at `/dist/`

## Previewing Locally

```bash
dualler preview -d dist
```

Displays the compiled bundle structure for manual inspection.

## Integrating with a Native App

### iOS

```swift
import DuallerSDK

let config = EngineConfig(
    debugMode: true,
    bundleURL: Bundle.main.url(forResource: "index", withExtension: "js")!,
    maxCacheSize: 5
)
let engine = try DuallerEngine.init(application, config: config)
// engine.pool can be used for per-page WebView management
```

### Android

```kotlin
val config = EngineConfig(
    debugMode = BuildConfig.DEBUG,
    bundleUrl = "file:///android_asset/dist/pages/index/index.js",
    maxCacheSize = 5
)
val engine = DuallerEngine.init(context, config)
setContentView(engine.webView)
// engine.pool provides PageWebViewPool for per-page navigation
```

## WebView Pool Configuration

Both Android and iOS SDKs support a configurable WebView pool with LRU eviction:

- `maxCacheSize` — maximum number of idle WebViews to keep (default: 5)
- When the pool is full, the least-recently-used WebView is destroyed
- Pages are loaded/unloaded automatically by the Router during navigation

## Next Steps

- Explore the `examples/` directory for complete working projects.
- Read `docs/architecture.md` to understand the overall design.
- Read `docs/compiler.md` to understand the compilation pipeline.
- Read `docs/runtime.md` to learn how the runtime manages state.
