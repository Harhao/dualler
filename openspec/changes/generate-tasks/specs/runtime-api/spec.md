## ADDED Requirements

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
