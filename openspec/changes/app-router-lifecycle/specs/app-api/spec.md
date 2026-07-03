## ADDED Requirements

### Requirement: App Registration
The system SHALL provide an `App(options)` function that registers global application configuration including lifecycle hooks (`onLaunch`, `onShow`, `onHide`), global data, and window-level defaults.

#### Scenario: Register app with onLaunch
- **WHEN** developer calls `App({ onLaunch() { ... }, globalData: { theme: 'dark' } })`
- **THEN** the system stores the options internally and invokes `onLaunch` immediately with an `options` object containing `query` and `scene`

#### Scenario: Register app multiple times is a no-op
- **WHEN** `App()` is called a second time
- **THEN** the system logs a warning and does not overwrite the first registration

#### Scenario: getApp() returns the app instance
- **WHEN** any page calls `getApp()`
- **THEN** the system returns an object with access to `globalData` and the registered lifecycle hooks

### Requirement: Global Window Defaults
The system SHALL allow `App()` to define default `window` configuration that applies to all pages unless overridden.

#### Scenario: App window config applies to all pages
- **WHEN** `App({ window: { navigationBarTitleText: 'My App', enablePullDownRefresh: false } })` is called
- **THEN** all pages inherit these defaults unless they specify their own `navigationBarTitleText` or `enablePullDownRefresh`

#### Scenario: Page-level window config overrides app defaults
- **WHEN** a page defines `window: { navigationBarTitleText: 'Detail' }` in its options
- **THEN** the page uses its own `navigationBarTitleText` instead of the app default

### Requirement: App Lifecycle Hooks
The system SHALL invoke app-level lifecycle hooks at the appropriate moments.

#### Scenario: onShow fires on first launch
- **WHEN** `App({ onShow() { ... } })` is registered
- **THEN** `onShow` is called immediately during `App()` registration (equivalent to first launch)

#### Scenario: onHide fires when last page navigates back to home
- **WHEN** the page stack becomes empty after `navigateBack`
- **THEN** `onHide` is called

### Requirement: Page Stack Initialization
The system SHALL maintain a page stack initialized by `App()` and managed by the Router.

#### Scenario: Page stack starts empty
- **WHEN** `App()` is called
- **THEN** the internal page stack is empty until the first navigation

#### Scenario: Page stack reflects current navigation state
- **WHEN** a sequence of `navigateTo` calls is executed
- **THEN** the page stack grows with each route, and `getCurrentPages()` returns pages from bottom to top
