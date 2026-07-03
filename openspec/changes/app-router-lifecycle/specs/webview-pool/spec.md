## ADDED Requirements

### Requirement: WebView Pool Interface
The system SHALL define a `PageWebViewPool` interface that manages a collection of reusable WebView instances.

#### Scenario: Pool creates WebView on demand
- **WHEN** `pool.acquire(route)` is called and no idle WebView exists for that route
- **THEN** the system creates a new WebView, loads the page bundle and CSS, and returns it

#### Scenario: Pool reuses idle WebView
- **WHEN** `pool.acquire(route)` is called and an idle WebView for that route exists
- **THEN** the system returns the existing WebView without recreating it

#### Scenario: Pool returns WebView on release
- **WHEN** `pool.release(webView)` is called
- **THEN** the system hides the WebView, cleans up its JS context if needed, and marks it as idle

### Requirement: LRU Eviction Policy
The system SHALL evict the least-recently-used WebView when the pool exceeds `maxCacheSize`.

#### Scenario: Evict LRU WebView when pool is full
- **WHEN** `pool.acquire()` is called and the pool has reached `maxCacheSize` idle WebViews
- **THEN** the system destroys the least-recently-used WebView and uses its resources for the new one

#### Scenario: Default maxCacheSize is 5
- **WHEN** no `maxCacheSize` is specified in the pool configuration
- **THEN** the pool allows up to 5 idle WebViews

### Requirement: Android WebView Pool Implementation
The Android SDK SHALL provide `PageWebViewPool.kt` that implements the pool interface using a pool of `DuallerWebView` instances.

#### Scenario: Acquire WebView for a route on Android
- **WHEN** `navigateTo({ url: 'pages/detail/detail' })` is called
- **THEN** `PageWebViewPool.acquire("pages/detail/detail")` creates or reuses a `DuallerWebView`, sets its page URL, and attaches it to the view hierarchy

#### Scenario: Release WebView on navigateBack on Android
- **WHEN** `navigateBack()` pops `pages/detail/detail` from the stack
- **THEN** `PageWebViewPool.release(detailWebView)` detaches the WebView and marks it idle

#### Scenario: Destroy WebView on LRU eviction on Android
- **WHEN** pool has 5 idle WebViews and a 6th acquire is requested
- **THEN** the system destroys the oldest idle `DuallerWebView` via `destroy()` and recycles its resources

### Requirement: iOS WebView Pool Implementation
The iOS SDK SHALL provide `PageWebViewPool.swift` that implements the pool interface using a pool of `WKWebView` instances.

#### Scenario: Acquire WebView for a route on iOS
- **WHEN** `navigateTo(url: "pages/detail/detail")` is called
- **THEN** `PageWebViewPool.acquire("pages/detail/detail")` creates or reuses a `DuallerWebView`, loads its bundle URL, and adds it to the view hierarchy

#### Scenario: Release WebView on navigateBack on iOS
- **WHEN** `navigateBack()` pops `pages/detail/detail` from the stack
- **THEN** `PageWebViewPool.release(detailWebView)` removes it from the view hierarchy and marks it idle

#### Scenario: Destroy WebView on LRU eviction on iOS
- **WHEN** pool has 5 idle WebViews and a 6th acquire is requested
- **THEN** the system calls `webView.removeFromSuperview()` and `webView.stopLoading()` on the oldest idle WebView

### Requirement: Engine Integration
The `DuallerEngine` SHALL use `PageWebViewPool` instead of managing a single singleton WebView.

#### Scenario: Engine initializes with a pool
- **WHEN** `DuallerEngine.init(context, config)` is called
- **THEN** the system creates a `PageWebViewPool` instance and uses it for all subsequent page navigations

#### Scenario: Engine forwards navigation to pool
- **WHEN** `engine.navigateTo(url)` is called
- **THEN** the system delegates to `pool.acquire(url)` which handles creation/reuse logic
