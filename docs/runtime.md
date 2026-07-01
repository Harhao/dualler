# Runtime Design

The Dualler runtime manages mini-program execution inside the native container.

## Architecture

```
┌─────────────────────────────────────────┐
│           Mini-program JS Context       │
│                                         │
│  Runtime API (wx.xxx) ◄──► Bridge      │
│  Page Registration                     │
│  Component Definition                  │
│  State Management                      │
└──────────┬──────────────────────────────┘
           │ Bridge Messages
           ▼
┌─────────────────────────────────────────┐
│           Native Container              │
│                                         │
│  BridgeManager ──► Router ──► Handlers  │
│  (WKWebView / WebView)                  │
│                                         │
│  Handler: Storage, Toast, Nav, File,    │
│           Device, Canvas, Media, Request│
└─────────────────────────────────────────┘
```

## Core Modules

### Page System (`page.ts`)

Pages are registered via `Page({...})` and managed by the router:

```typescript
interface PageOptions {
  data: Record<string, any>;
  onLoad?: () => void;
  onReady?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onUnload?: () => void;
  [method: string]: Function | any;
}
```

Each page instance maintains its own reactive data scope.

### Component System (`component.ts`)

Custom components extend the built-in element types:

```typescript
interface ComponentOptions {
  properties: Record<string, PropertyType>;
  observers: Record<string, (newValue: any, oldValue: any) => void>;
  data: Record<string, any>;
  methods: Record<string, Function>;
}
```

Properties support type coercion and two-way data binding via observers.

### Observer System (`observer.ts`)

Reactive data binding uses a dependency-tracking system:

1. `defineData(initialValue)` creates a reactive proxy.
2. Computed values track their dependencies automatically.
3. `setData({...})` triggers watchers and generates patch instructions.
4. Patches flow through the renderer to update the DOM.

```typescript
interface Observer {
  subscribe(key: string, callback: (newVal: any, oldVal: any) => void): void;
  notify(key: string, newVal: any, oldVal: any): void;
}
```

### Router (`router.ts`)

Handles page navigation and stack management:

```typescript
interface Router {
  navigateTo(url: string, params?: Record<string, any>): void;
  redirectTo(url: string): void;
  switchTab(url: string): void;
  navigateBack(delta?: number): void;
  getCurrentPage(): string;
}
```

The router maintains a navigation stack and passes query parameters
via the bridge to native handlers.

### Error Handling (`errors.ts`)

Errors are captured, formatted, and reported:

- JS exceptions are caught by the native JSContext/QuickJS exception handler.
- Network failures are wrapped with user-friendly error messages.
- Development mode includes stack traces; production mode strips them.

## Rendering Flow

1. DSL bundle is loaded in the WebView.
2. Runtime parses the VNode tree and creates virtual DOM nodes.
3. Diff algorithm compares with previous render state.
4. Patch instructions are serialized and sent via the native bridge.
5. Native ViewManager applies changes to actual UI components.
6. For WebView-based rendering, patches are translated to JavaScript DOM updates.
