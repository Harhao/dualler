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

# Build the compiler
cd packages/dualler-compiler
pnpm build
cd ../..

# Link the CLI globally (optional)
cd packages/dualler-cli
pnpm link --global
cd ..
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
├── dualler.config.ts       # Project configuration
├── package.json
└── src/
    ├── App.vue              # Root component
    ├── pages.json           # Page registry
    └── pages/
        └── index.vue        # Home page
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

Output goes to `dist/`. Each page gets a `.bundle.js` file containing the compiled DSL.

## Development Mode

```bash
dualler dev
```

Starts the dev server at `http://localhost:3000` with:
- File watching for `.vue` changes
- Incremental recompilation via `@dualler/compiler`
- WebSocket-based hot module replacement
- Bundle served at `/dist/`

The dev server registers the following endpoints:

| Endpoint             | Purpose                      |
|----------------------|------------------------------|
| `GET /dist/`         | Compiled bundle files        |
| `GET /dualler-config.json` | Server configuration   |
| `WS :3000`           | HMR WebSocket connection     |

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
    bundleURL: Bundle.main.url(forResource: "index", withExtension: "js")!
)
let engine = try DuallerEngine.init(UIApplication.shared, config: config)
```

See `/Users/haohar/code-space/dualler/sdk/ios/` for the full SDK source.

### Android

```kotlin
val config = EngineConfig(
    bundleURL = assets.open("index.js").toURI()
)
val engine = DuallerEngine.init(applicationContext, config)
```

See `/Users/haohar/code-space/dualler/sdk/android/` for the full SDK source.

## Next Steps

- Explore the `examples/` directory for complete working projects.
- Read `docs/compiler.md` to understand the compilation pipeline.
- Read `docs/runtime.md` to learn how the runtime manages state.
- Read `docs/sdk-api.md` for native API reference.
