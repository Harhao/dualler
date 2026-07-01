# iOS Test App

This is a minimal iOS application that integrates the Dualler SDK for testing purposes.

## Structure

```
ios-test-app/
├── Info.plist
├── AppDelegate.swift
└── ViewController.swift
```

## Purpose

This project demonstrates how to embed the Dualler engine within a native iOS
application. It loads a compiled mini-program bundle and renders it via the
DuallerEngine/DuallerWebView components.

## Integration

The Dualler iOS SDK is integrated via Swift Package Manager using `sdk/ios/Package.swift`.

## Usage

1. Compile a mini-program: `dualler build`
2. Place the compiled bundle into the app bundle
3. Initialize DuallerEngine with the bundle URL
4. The SDK will inject the JS bridge and render the mini-program in a WKWebView

## Initialization Example

```swift
let config = EngineConfig(
    debugMode: true,
    bundleURL: Bundle.main.url(forResource: "index", withExtension: "js")!
)
let engine = try DuallerEngine.init(UIApplication.shared, config: config)
```
