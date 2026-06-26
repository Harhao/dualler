# @dualler/compiler API Documentation

## Overview

The Dualler Compiler transforms Vue3 Single File Components (SFC) into mini-program compatible output (HTML/JS/CSS) that runs in Dualler's WebView-based runtime.

## Installation

```bash
npm install @dualler/compiler
```

## CLI Usage

### Build

```bash
dualler-compiler build [options]

Options:
  --appId        Mini-program appId (required)
  --entry        Entry file path (default: src/app.vue)
  --pages        Page file list, comma-separated
  --components   Component file list, comma-separated
  --outputDir    Output directory (default: ./dist)
  --minify       Enable minification (default: true)
  --config       Path to config file
  --projectRoot  Project root directory
```

### Watch

```bash
dualler-compiler watch [options]

Same options as build, plus:
  --interval     Polling interval in ms (default: 300)
```

### Preview

```bash
dualler-compiler preview [options]

Options:
  --outputDir    Directory to serve (default: ./dist)
  --port         Server port (default: 8080)
```

### Inspect

```bash
dualler-compiler inspect <file>

Inspect a Vue SFC file and show compilation metadata.
```

## Programmatic API

### `bundle(options)`

Main bundler function that compiles a complete mini-program.

```typescript
import { bundle } from '@dualler/compiler';

const result = await bundle({
  appId: 'com.example.app',
  entry: './src/app.vue',
  pages: ['src/pages/index/index', 'src/pages/detail/detail'],
  components: ['src/components/MyButton'],
  outputDir: './dist',
  projectRoot: process.cwd(),
});
```

**Options:**
- `appId: string` - Mini-program application ID
- `entry: string` - Entry file path (app.vue)
- `pages: string[]` - Page paths relative to project root
- `components: string[]` - Component paths relative to project root
- `outputDir: string` - Output directory
- `minify?: boolean` - Enable minification (default: true)
- `sourceMap?: boolean` - Enable source maps
- `projectRoot?: string` - Project root directory
- `srcDir?: string` - Source directory prefix to strip
- `appConfig?: object` - App configuration from app.json

**Returns:**
- `files: Map<string, FileInfo>` - Generated files
- `manifest: Manifest` - Build manifest
- `dependencyGraph: DependencyGraph` - Component dependency graph
- `warnings: string[]` - Compilation warnings

### `parseSFC(source, filename)`

Parse a Vue3 SFC file.

```typescript
import { parseSFC } from '@dualler/compiler';

const result = parseSFC(source, 'index.vue');
// result.descriptor - SFCDescriptor from @vue/compiler-sfc
// result.langInfo - Language information
// result.hasScriptSetup - Whether uses <script setup>
// result.componentName - Derived component name
```

### `compileTemplate(template, options?)`

Compile a Vue template to Dualler-compatible HTML.

```typescript
import { compileTemplate } from '@dualler/compiler';

const result = compileTemplate('<view @tap="handler">{{ msg }}</view>');
// result.code - Compiled HTML
// result.deps - Reactive dependencies
// result.nativeComponents - Native component tags
// result.customComponentTags - Custom component tags
```

**Transformations:**
- `view` → `div`
- `text` → `span`
- `image` → `img`
- `@tap` → `@click`
- `wx:if` → `v-if`
- `wx:for` → `v-for`

### `compileScript(source, options?)`

Compile Vue script to Dualler runtime JavaScript.

```typescript
import { compileScript } from '@dualler/compiler';

const result = compileScript(source, {
  isSetup: true,
  wrapAsPage: true,
  componentName: 'Index',
});
// result.code - Compiled JavaScript
// result.imports - Detected imports
// result.reactiveVars - Reactive variables
// result.lifecycleHooks - Lifecycle hooks used
```

**API Mappings:**
- `ref` → `__dualler_ref`
- `reactive` → `__dualler_reactive`
- `computed` → `__dualler_computed`
- `watch` → `__dualler_watch`
- `onMounted` → `__dualler_onReady`
- `onUnmounted` → `__dualler_onUnload`

### `compileStyle(source, options?)`

Compile CSS for Dualler mini-program.

```typescript
import { compileStyle } from '@dualler/compiler';

const result = await compileStyle('.box { padding: 20rpx; }', {
  scoped: true,
  id: 'abc123',
  designWidth: 750,
});
// result - Compiled CSS with rpx→vw conversion and scoped selectors
```

### `buildDependencyGraph(files, projectRoot)`

Build component dependency graph.

```typescript
import { buildDependencyGraph } from '@dualler/compiler';

const graph = buildDependencyGraph(files, projectRoot);
// graph.pages - Page components
// graph.components - Non-page components
// graph.imports - Import relationships
```

## Output Format

The compiler generates:

```
dist/
├── app.js              # App entry (lifecycle hooks)
├── app.css             # Global styles
├── manifest.json       # Build manifest
└── pages/
    └── index/
        ├── index.html  # Page template (Vue3 syntax)
        ├── index.js    # Page logic (Dualler runtime)
        └── index.css   # Page styles (rpx→vw, scoped)
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
  },
  "componentRegistry": {}
}
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

```json
{
  "appId": "com.example.app",
  "pages": [
    "pages/index/index",
    "pages/detail/detail"
  ],
  "window": {
    "navigationBarBackgroundColor": "#1a73e8",
    "navigationBarTitleText": "My App"
  }
}
```

## Template Syntax Support

### Supported Directives

| WeChat Syntax | Vue3 Syntax | Description |
|---------------|-------------|-------------|
| `wx:if` | `v-if` | Conditional rendering |
| `wx:elif` | `v-else-if` | Else-if condition |
| `wx:else` | `v-else` | Else block |
| `wx:for` | `v-for` | List rendering |
| `wx:key` | `:key` | List key |
| `wx:show` | `v-show` | Show/hide |
| `wx:model` | `v-model` | Two-way binding |

### Supported Events

| WeChat Syntax | Vue3 Syntax | Description |
|---------------|-------------|-------------|
| `bind:tap` | `@click` | Click event |
| `catch:tap` | `@click.stop` | Click with stop propagation |
| `@tap` | `@click` | Vue-style tap |
| `bind:input` | `@input` | Input event |
| `bind:submit` | `@submit` | Form submit |

### Supported Tags

| Mini-program Tag | HTML Tag | Description |
|-----------------|----------|-------------|
| `view` | `div` | Container |
| `text` | `span` | Text |
| `image` | `img` | Image |
| `scroll-view` | `div` | Scrollable container |
| `navigator` | `a` | Navigation link |
| `button` | `button` | Button |
| `input` | `input` | Input field |
| `textarea` | `textarea` | Text area |

## Error Handling

The compiler throws typed errors:

```typescript
import { CompilerError, ScriptCompileError } from '@dualler/compiler';

try {
  await bundle(options);
} catch (err) {
  if (err instanceof CompilerError) {
    console.error(err.file, err.line, err.column);
    console.error(err.suggestion);
  }
}
```
