## ADDED Requirements

### Requirement: Dev server shall support HMR
The dev server SHALL watch for file changes and push updates to running apps via WebSocket.

#### Scenario: Watch files
- **WHEN** .vue files change
- **THEN** server recompiles and sends update via WebSocket

#### Scenario: Hot reload
- **WHEN** client receives update
- **THEN** Runtime applies changes without full reload
