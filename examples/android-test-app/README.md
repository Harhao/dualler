# Android Test App

This is a minimal Android application that integrates the Dualler Android SDK for testing purposes.

## Structure

```
android-test-app/
├── AndroidManifest.xml
├── build.gradle.kts
└── src/
    └── main/
        └── java/com/example/duallertest/
            └── MainActivity.kt
```

## Purpose

This project demonstrates how to embed the Dualler engine within a native Android
application. It loads a compiled mini-program bundle and renders it via the
DuallerEngine/DuallerWebView components.

## Integration

The Dualler Android SDK is linked via the shared module under `sdk/shared`.

## Usage

1. Compile a mini-program: `dualler build`
2. Place the `dist/` folder into `src/main/assets/`
3. Launch the app and the SDK will load the bundle automatically
