## ADDED Requirements

### Requirement: Load Page Bundle and Styles
The system SHALL dynamically load a page's JavaScript bundle and CSS stylesheet when navigating to that page.

#### Scenario: Load page bundle on navigateTo
- **WHEN** `navigateTo({ url: 'pages/detail/detail' })` is called
- **THEN** the system loads `pages/detail/detail.js` bundle and evaluates it, registering the page if not already registered

#### Scenario: Load page CSS on navigateTo
- **WHEN** `navigateTo({ url: 'pages/detail/detail' })` is called
- **THEN** the system loads `pages/detail/detail.css` and injects it into the page's WebView

#### Scenario: Load page fails gracefully
- **WHEN** the bundle file does not exist at the expected path
- **THEN** the system invokes the error handler (if configured) and does not crash

### Requirement: Unload Page Resources
The system SHALL remove page bundle evaluation artifacts and CSS styles when a page is popped from the stack.

#### Scenario: Unload CSS on navigateBack
- **WHEN** `navigateBack()` causes `pages/detail/detail` to be popped
- **THEN** the system removes the CSS element associated with that page from the WebView

#### Scenario: Unload triggers onUnload hook
- **WHEN** a page is popped from the stack
- **THEN** the page's `onUnload()` lifecycle hook is called before resources are removed

### Requirement: Route-to-File Mapping
The system SHALL map a route string (e.g., `pages/detail/detail`) to its bundle path (`pages/detail/detail.js`) and style path (`pages/detail/detail.css`).

#### Scenario: Map route to bundle path
- **WHEN** route is `pages/index/index`
- **THEN** the system resolves the bundle to `pages/index/index.js` and style to `pages/index/index.css`

#### Scenario: Map route to app-level assets
- **WHEN** the route is the initial page (first page pushed)
- **THEN** the system also loads `app.js` and `app.css` if not already loaded

### Requirement: Idempotent Page Load
Loading the same page multiple times SHALL NOT duplicate bundle evaluation or CSS injection.

#### Scenario: Navigate to same page twice
- **WHEN** `navigateTo({ url: 'pages/detail/detail' })` is called, then `navigateTo({ url: 'pages/detail/detail' })` again
- **THEN** the bundle is evaluated once, and the CSS is injected once; the second call only pushes the route to the stack

#### Scenario: Re-loading already-loaded page is a no-op
- **WHEN** a page has been loaded (bundle evaluated, CSS injected)
- **THEN** subsequent navigations to the same route skip loading and only update the stack
