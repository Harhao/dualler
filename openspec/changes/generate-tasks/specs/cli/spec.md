## ADDED Requirements

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
