# Android Test App

This is a minimal Android application that integrates the Dualler Android SDK for testing purposes.

## Structure

```
android-test-app/
├── build.gradle.kts              # App-level Gradle config with SDK dependency
├── settings.gradle.kts           # Includes sdk project in build
├── gradle.properties             # Build configuration
├── AndroidManifest.xml           # App manifest with MainActivity
└── src/
    └── main/
        ├── AndroidManifest.xml
        ├── assets/
        │   ├── pages.json                # Mini-program page routes
        │   └── dist/pages/index/         # Compiled bundle output
        │       ├── bundle.js             # Logic layer JS
        │       ├── style.css             # Stylesheet
        │       └── pages.json            # Page-level config
        ├── java/com/example/duallertest/
        │   └── MainActivity.kt
        └── res/values/
            └── strings.xml
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
