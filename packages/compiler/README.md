# @dualler/compiler

Vue3 Mini-Program Compiler for the Dualler Engine SDK.

Transforms Vue3 Single File Components (SFC) into mini-program compatible output (HTML/JS/CSS) that runs in Dualler's WebView-based runtime.

## Features

- **Vue3 SFC Support**: Full support for `<template>`, `<script>`, `<script setup>`, and `<style>` blocks
- **Composition API**: Automatic mapping of Vue3 Composition API to Dualler runtime
- **Template Compilation**: Mini-program directives (wx:if, wx:for) → Vue3 directives
- **Event Mapping**: WeChat events (bind:tap, catch:tap) → Vue events (@click, @click.stop)
- **Style Processing**: rpx → vw conversion, scoped CSS with PostCSS
- **WXS Support**: WeiXin Script blocks for render-layer-only logic
- **Dependency Graph**: Automatic component dependency analysis
- **Watch Mode**: Incremental compilation on file changes
- **Dev Server**: Local preview server with CORS support

## Installation

```bash
npm install @dualler/compiler
```

## Quick Start

### CLI Usage

```bash
# Build from config file
dualler-compiler build

# Build with explicit options
dualler-compiler build \
  --appId com.example.app \
  --entry src/app.vue \
  --pages src/pages/index/index,src/pages/detail/detail \
  --outputDir ./dist

# Watch mode
dualler-compiler watch --appId com.example.app --pages src/pages/index/index

# Preview built output
dualler-compiler preview --port 8080

# Inspect a Vue file
dualler-compiler inspect src/pages/index/index.vue
```

### Programmatic API

```typescript
import { bundle } from '@dualler/compiler';

const result = await bundle({
  appId: 'com.example.app',
  entry: './src/app.vue',
  pages: ['src/pages/index/index'],
  components: ['src/components/MyButton'],
  outputDir: './dist',
  projectRoot: process.cwd(),
});

console.log(`Built ${result.files.size} files`);
console.log(`Total size: ${result.manifest.totalSize} bytes`);
```

## Configuration

### dualler.config.json

```json
{
  "appId": "com.example.app",
  "entry": "src/app.vue",
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "components": [
    "components/MyButton"
  ],
  "outputDir": "./dist"
}
```

### app.json (WeChat-compatible)

The compiler also reads `app.json` for configuration:

```json
{
  "appId": "com.example.app",
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "window": {
    "navigationBarTitleText": "My App"
  }
}
```

## Template Syntax

### Supported Directives

| WeChat | Vue3 | Example |
|--------|------|---------|
| `wx:if` | `v-if` | `<view wx:if="{{show}}">` → `<div v-if="show">` |
| `wx:for` | `v-for` | `<view wx:for="{{list}}">` → `<div v-for="(item, index) in list">` |
| `wx:key` | `:key` | `wx:key="id"` → `:key="id"` |
| `wx:show` | `v-show` | `<view wx:show="{{visible}}">` → `<div v-show="visible">` |
| `wx:model` | `v-model` | `<input wx:model="{{value}}">` → `<input v-model="value">` |

### Supported Events

| WeChat | Vue3 | Description |
|--------|------|-------------|
| `bind:tap` | `@click` | Click event |
| `catch:tap` | `@click.stop` | Click with stop propagation |
| `capture-bind:tap` | `@click.capture` | Capture phase |
| `@tap` | `@click` | Vue-style tap (converted) |

### Tag Mapping

| Mini-program | HTML | Description |
|--------------|------|-------------|
| `view` | `div` | Container |
| `text` | `span` | Text content |
| `image` | `img` | Image |
| `scroll-view` | `div` | Scrollable container |
| `navigator` | `a` | Navigation link |

## API Mappings

Vue3 Composition API is automatically mapped to Dualler runtime:

| Vue3 | Dualler | Description |
|------|---------|-------------|
| `ref()` | `__dualler_ref()` | Reactive reference |
| `reactive()` | `__dualler_reactive()` | Reactive object |
| `computed()` | `__dualler_computed()` | Computed property |
| `watch()` | `__dualler_watch()` | Watch effect |
| `onMounted()` | `__dualler_onReady()` | Component mounted |
| `onUnmounted()` | `__dualler_onUnload()` | Component unmounted |
| `onActivated()` | `__dualler_onShow()` | Keep-alive activated |
| `onDeactivated()` | `__dualler_onHide()` | Keep-alive deactivated |

## Output Structure

```
dist/
├── app.js              # App entry with lifecycle hooks
├── app.css             # Global styles (rpx → vw)
├── manifest.json       # Build manifest with routes and metadata
└── pages/
    └── index/
        ├── index.html  # Page template (Vue3 syntax)
        ├── index.js    # Page logic (Dualler runtime)
        └── index.css   # Page styles (scoped, rpx converted)
```

### manifest.json

```json
{
  "appId": "com.example.app",
  "version": "1.0.0",
  "compilerVersion": "2.0.0",
  "pages": ["pages/index/index"],
  "components": [],
  "files": { ... },
  "totalSize": 28066,
  "buildTime": "2026-06-16T06:01:25.111Z",
  "pageRoutes": {
    "pages/index/index": {
      "path": "pages/index/index.html"
    }
  }
}
```

## Error Handling

The compiler provides detailed error messages with file locations:

```typescript
import { CompilerError } from '@dualler/compiler';

try {
  await bundle(options);
} catch (err) {
  if (err instanceof CompilerError) {
    console.error(`${err.file}:${err.line}:${err.column}`);
    console.error(err.message);
    if (err.suggestion) {
      console.error(`💡 ${err.suggestion}`);
    }
  }
}
```

## Development

```bash
# Build the compiler
yarn build

# Run tests
yarn test

# Watch mode for development
yarn test:watch
```

## License

MIT
