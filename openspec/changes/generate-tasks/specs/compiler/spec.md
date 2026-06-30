## ADDED Requirements

### Requirement: Compiler shall parse Vue SFC and output DSL Bundle
The compiler SHALL accept .vue single-file components and output a .bundle.js file containing DSL data description and logic code.

#### Scenario: Parse Vue SFC
- **WHEN** user provides a .vue file with <template>, <script>, and <style>
- **THEN** compiler extracts each section and produces valid DSL AST

#### Scenario: Compile template to DSL AST
- **WHEN** <template> contains <view>, <image>, <text> tags
- **THEN** compiler transforms them to DSL nodes with tag, props, and children

#### Scenario: Compile style to CSS
- **WHEN** <style> contains CSS rules
- **THEN** compiler transforms them to CSS style objects

#### Scenario: Bundle output
- **WHEN** compilation completes
- **THEN** output is a .bundle.js file with minified and obfuscated code

### Requirement: Runtime Core shall manage Page and Component lifecycle
The runtime core SHALL provide Page() and Component() APIs for developers to define pages and components.

#### Scenario: Define a page
- **WHEN** developer calls Page({ data: {...}, onLoad() {...} })
- **THEN** runtime registers the page and initializes data

#### Scenario: Component registration
- **WHEN** developer calls Component({ properties: {...}, methods: {...} })
- **THEN** runtime registers the component and makes it available

#### Scenario: Page lifecycle
- **WHEN** page is loaded, shown, hidden, or unloaded
- **THEN** runtime calls corresponding lifecycle hooks

### Requirement: Runtime Renderer shall compute diffs and generate patch instructions
The runtime renderer SHALL compare old and new VNode trees and generate patch instructions for the view layer.

#### Scenario: Compute diff
- **WHEN** data changes via setData()
- **THEN** runtime compares old and new VNode trees

#### Scenario: Generate patch instructions
- **WHEN** diff completes
- **THEN** runtime produces a list of patch instructions (add/update/remove nodes)

#### Scenario: Serialize instructions
- **WHEN** patch instructions are ready
- **THEN** runtime serializes them to BridgeMessage format

### Requirement: Runtime API shall expose system capabilities
The runtime API SHALL provide dualler.request, dualler.getStorageSync, dualler.showToast, and other system APIs.

#### Scenario: Make network request
- **WHEN** developer calls dualler.request({ url: '...', success: fn })
- **THEN** runtime sends the request via Bridge to Native

#### Scenario: Store data
- **WHEN** developer calls dualler.setStorageSync('key', 'value')
- **THEN** runtime stores data in Native file system

#### Scenario: Show toast
- **WHEN** developer calls dualler.showToast({ title: 'Success' })
- **THEN** runtime shows native toast via Bridge

### Requirement: Native SDK shall manage WebView and JS Context
The native SDK SHALL create and manage a WebView for rendering and an independent JS Context for logic layer.

#### Scenario: Initialize engine
- **WHEN** developer calls DuallerEngine.init(context, config)
- **THEN** SDK creates WebView + JS Context + BridgeManager

#### Scenario: Load bundle
- **WHEN** bundle.js is loaded
- **THEN** JS Context executes the Runtime code

#### Scenario: Render view
- **WHEN** WebView receives patch instructions
- **THEN** WebView renders the updated view tree

### Requirement: Bridge shall route messages between Runtime and Native
The bridge SHALL serialize messages from Runtime, route them in Native, and deliver responses back.

#### Scenario: Send message from Runtime
- **WHEN** Runtime calls transmitter.send(message)
- **THEN** message is serialized and sent to Native via Bridge

#### Scenario: Route message in Native
- **WHEN** BridgeManager receives message
- **THEN** Parser decodes it, Router dispatches to correct Handler

#### Scenario: Return response
- **WHEN** Handler completes processing
- **THEN** response is sent back to Runtime via Bridge

### Requirement: CLI shall provide build, dev, preview, and create commands
The CLI SHALL offer dualler build, dualler dev, dualler preview, and dualler create commands for developers.

#### Scenario: Build project
- **WHEN** developer runs dualler build
- **THEN** compiler processes all .vue files and outputs .bundle.js

#### Scenario: Start dev server
- **WHEN** developer runs dualler dev
- **THEN** dev server starts with HMR support

#### Scenario: Create new project
- **WHEN** developer runs dualler create my-app
- **THEN** interactive prompt shows templates and generates project

### Requirement: Dev server shall support HMR
The dev server SHALL watch for file changes and push updates to running apps via WebSocket.

#### Scenario: Watch files
- **WHEN** .vue files change
- **THEN** server recompiles and sends update via WebSocket

#### Scenario: Hot reload
- **WHEN** client receives update
- **THEN** Runtime applies changes without full reload

### Requirement: Build plugins shall integrate with Vite and Rspack
The build plugins SHALL provide transform hooks for Vite and Rspack to compile .vue files.

#### Scenario: Vite integration
- **WHEN** Vite encounters .vue file
- **THEN** plugin transforms it using dualler-compiler

#### Scenario: Rspack integration
- **WHEN** Rspack encounters .vue file
- **THEN** plugin transforms it using dualler-compiler
