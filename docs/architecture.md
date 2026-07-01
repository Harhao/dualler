# Architecture

Dualler is a mini-program engine that compiles Vue 3 SFC files into a cross-platform DSL,
and renders them natively on Android and iOS.

## Overview

```
┌─────────────────────────────────────────────────────┐
│                   Developer Workspace               │
│                                                     │
│  *.vue  files  ──►  dualler build  ──►  bundle.js   │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────┐        ┌──────────────────┐        ┌──────────────┐
│  CLI     │        │  Compiler        │        │  Native SDK  │
│  create  │        │  @dualler/compiler│       │  iOS/Android │
│  build   │───────►│  Parse Vue SFC   │───────►│  DuallerSDK  │
│  dev     │        │  Transform to DSL│        └──────────────┘
│  preview │        │  Generate bundle │                 │
└──────────┘        └──────────────────┘                 ▼
                                            ┌─────────────────────┐
                                            │   Runtime Engine    │
                                            │   (WKWebView /      │
                                            │    WebView)         │
                                            └─────────────────────┘
```

## Components

### Compiler (`@dualler/compiler`)

The compiler is the core of Dualler. It parses Vue Single-File Components and
transforms them into a platform-agnostic DSL bundle.

1. **Parser**: Reads `.vue` files and extracts `<template>`, `<script>`, and `<style>` blocks.
2. **Transformer**: Converts the template AST into a DSL representation (VNode-like tree).
3. **Code Generator**: Emits executable JavaScript/JSON bundle.
4. **Bundler**: Combines all pages into deployable `.bundle.js` files.

### Runtime Core (`@dualler/runtime-core`)

The runtime manages lifecycle, state, and routing inside the mini-program container.

- **Page**: Page registration and lifecycle hooks (onLoad, onShow, onHide, onUnload).
- **Component**: Custom component registration with properties and observers.
- **Observer**: Reactive data binding system that triggers updates when data changes.
- **Router**: Cross-page navigation (navigateTo, redirectTo, switchTab).

### Runtime Renderer (`@dualler/runtime-renderer`)

The renderer translates DSL into platform-specific UI instructions.

- **VNode**: Virtual node representation of UI elements.
- **Diff**: Compares old and new VNode trees to compute minimal patches.
- **Patch**: Generates bridge messages from diff results.
- **Serializer**: Converts patch instructions to JSON BridgeMessage format.
- **Transmitter**: Sends messages to the native layer via the JavaScript bridge.

### Runtime API (`@dualler/runtime-api`)

Provides a WeChat Mini Program compatible API surface:

- Network (request), Storage (sync/async), Toast, Navigation, File System,
  Device Info, Canvas, Media, Share.

### Native SDK (`sdk/ios`, `sdk/android`)

Native containers that load and render mini-program bundles.

#### iOS
Built on top of `WKWebView` + `JavaScriptCore`. Key classes:
- `DuallerEngine`: Entry point, initializes the mini-program container.
- `DuallerWebView`: Wraps WKWebView and injects the JS bridge.
- `BridgeManager`: Routes messages between JS and native handlers.
- `Handler` implementations: Native API handlers (storage, network, toast, etc.).

#### Android
Built on top of `WebView` + `QuickJs`. Mirror architecture to iOS.

### CLI (`dualler-cli`)

Development tools for creating, building, and serving mini-programs.

- `dualler create`: Interactive wizard to scaffold new projects.
- `dualler build`: Compiles all pages into bundle files.
- `dualler dev`: Starts a development server with file watching and HMR.
- `dualler preview`: Displays compiled bundle structure locally.

### Dev Server (`@dualler/dev-server`)

An Express + WebSocket server for development:
- Serves compiled bundles
- Watches for file changes
- Triggers incremental recompilation
- Pushes HMR patches via WebSocket

### Build Plugins

Integrate Dualler compilation into existing toolchains:

- **Vite Plugin**: Uses Vite's transform hook to compile `.vue` files.
- **Rspack Plugin**: Uses compilation hooks to emit bundle assets.

## Data Flow

1. Developer writes `.vue` files
2. CLI/Plugin compiles them to DSL bundles
3. Native SDK loads the bundle in a WebView
4. JS runtime interprets the DSL and communicates with native handlers
5. BridgeManager routes API calls to native implementations
6. Native handlers respond via the same bridge
7. Runtime Renderer applies diffs and updates the UI
