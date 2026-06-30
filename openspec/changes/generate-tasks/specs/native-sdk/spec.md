## ADDED Requirements

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
