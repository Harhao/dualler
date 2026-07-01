# Compiler Design

The Dualler compiler transforms Vue 3 Single-File Components into a cross-platform
DSL bundle that can be executed by the native runtime.

## Pipeline

```
.vue source → Parser → Transformer → Codegen → Bundler → Output
```

## Parser

The parser extracts the three blocks from a `.vue` file:

- `<template>`: The UI declaration
- `<script>`: Component logic (supports `<script setup lang="ts">`)
- `<style>`: Scoped CSS

```typescript
interface VueSFC {
  template: SFCBlock;
  script: SFCBlock | null;
  styles: SFCStyleBlock[];
}
```

The parser uses `@vue/compiler-sfc` for robust SFC parsing, then extracts
additional metadata like script language, scoped styles, and custom block.

## Transformer

The transformer converts the parsed Vue blocks into a DSL AST.

### Template Transformation

The template block is converted from HTML-like syntax to a JSON VNode tree:

```json
{
  "tag": "view",
  "props": { "class": "container" },
  "children": [
    { "tag": "text", "props": { "textContent": "Hello" } }
  ]
}
```

Directive handling:
- `v-for` → expands to repeated child nodes with keys
- `v-if` / `v-else` → conditional inclusion in the tree
- `:prop` / `v-bind` → static or reactive prop mapping
- `@event` / `v-on` → event binding declarations
- `{{}}` interpolations → reactive property references

### Script Handling

`<script setup>` blocks are processed separately:
- Exports are extracted for component registration
- Import statements are rewritten to use `@dualler/runtime-api`
- TypeScript is preserved (transpiled to plain JS at bundle time)

### Style Handling

Scoped styles are collected and emitted alongside the DSL bundle.
Class names in scoped styles are automatically mapped to VNode prop attributes.

## Code Generation

The code generator produces executable output:

1. **Render function generation**: Converts the DSL AST into JavaScript render calls.
2. **Event binding emission**: Generates handlers for `bindtap` and `@click` events.
3. **Lifecycle injection**: Adds `onLoad`, `onReady`, `onShow`, `onHide`, `onUnload` hooks.

Output format: A JSON bundle containing the VNode tree, style sheet, and metadata.

## Bundler

The bundler combines all page bundles into a deployable unit:

- Merges shared dependencies (runtime-core, runtime-api)
- Applies optional code obfuscation
- Emits platform-agnostic `.bundle.js` files per page

## API

```typescript
interface CompileResult {
  dsl: DSLTree;      // The transformed DSL representation
  css?: string;       // Compiled styles
  patches?: Patch[];  // Hot-reload patch instructions
  bundle: string;     // Full bundle source
}

function compile(input: {
  source: string;
  filename?: string;
}): CompileResult;
```

## Error Handling

The compiler wraps errors in categorized types:
- **ParseError**: Invalid Vue SFC syntax
- **TransformError**: Unsupported directive or syntax
- **GenerateError**: Code generation failure
- **BundleError**: Bundling output failure
