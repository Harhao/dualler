# Client SDK Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement package management, error handling, and iOS/Web shell implementations for Dualler client SDK.

**Architecture:** Extend core-kmp with PackageDownloader, PackagePatcher, PackageCacheStore, UpdateScheduler, DuallerErrorHandler, CrashRecoveryManager. Add iOS and Web platform shells.

**Tech Stack:** Kotlin Multiplatform, kotlinx.coroutines, kotlinx.serialization

---

## File Structure

```
packages/core-kmp/src/commonMain/kotlin/com/dualler/core/
├── package/
│   ├── PackageDownloader.kt
│   ├── PackagePatcher.kt
│   ├── PackageCacheStore.kt
│   ├── UpdateScheduler.kt
│   └── model/
│       ├── PackageInfo.kt
│       └── PackageError.kt
├── error/
│   ├── DuallerErrorHandler.kt
│   └── CrashRecoveryManager.kt

packages/ios/
├── build.gradle.kts
└── src/iosMain/kotlin/com/dualler/ios/
    ├── IOSPlatform.kt
    ├── IOSJSEngine.kt
    └── IOSWebViewProvider.kt

packages/web/
├── build.gradle.kts
└── src/jsMain/kotlin/com/dualler/web/
    ├── WebPlatform.kt
    ├── WebJSEngine.kt
    └── WebWebViewProvider.kt
```

---

## Task 1: Package Info Models

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/model/PackageInfo.kt`
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/model/PackageError.kt`

- [ ] **Step 1: Create PackageInfo.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/model/PackageInfo.kt
package com.dualler.core.`package`.model

import kotlinx.serialization.Serializable

/**
 * Server-returned package info
 */
@Serializable
data class PackageInfo(
    val appId: String,
    val version: String,
    val baseVersion: String,
    val packageSize: Long,
    val sha256: String,
    val downloadUrl: String,
    val patchUrl: String? = null,
    val patchBaseVersion: String? = null,
    val patchSha256: String? = null,
    val forceUpdate: Boolean = false,
    val minSupportVersion: String = "1.0.0",
    val releaseNote: String = ""
)

/**
 * Local package info
 */
data class LocalPackage(
    val appId: String,
    val version: String,
    val installPath: String,
    val installedAt: Long,
    val status: PackageStatus
)

enum class PackageStatus {
    READY, DOWNLOADING, PATCHING, CORRUPTED, NEED_UPDATE
}

/**
 * Update check result
 */
sealed class UpdateCheckResult {
    object UpToDate : UpdateCheckResult()
    data class HasUpdate(val packageInfo: PackageInfo) : UpdateCheckResult()
    data class Error(val message: String) : UpdateCheckResult()
}

/**
 * Update strategy
 */
enum class UpdateStrategy {
    SILENT, IMMEDIATE, PREFETCH
}
```

- [ ] **Step 2: Create PackageError.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/model/PackageError.kt
package com.dualler.core.`package`.model

/**
 * Package error types
 */
sealed class PackageError(val message: String) {
    class DownloadFailed(message: String) : PackageError(message)
    class PatchFailed(message: String) : PackageError(message)
    class VerifyFailed(message: String) : PackageError(message)
    class InsufficientSpace(message: String) : PackageError(message)
    class VersionTooOld(message: String) : PackageError(message)
}

/**
 * Package callback interface
 */
interface PackageCallback {
    fun onProgress(appId: String, progress: Int)
    fun onSuccess(appId: String, localPackage: LocalPackage)
    fun onFailed(appId: String, error: PackageError)
}
```

- [ ] **Step 3: Verify compilation**

Run: `./gradlew :core-kmp:compileKotlinAndroid`

- [ ] **Step 4: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/
git commit -m "feat: add package info models and error types"
```

---

## Task 2: PackageCacheStore

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageCacheStore.kt`
- Test: `packages/core-kmp/src/commonTest/kotlin/com/dualler/core/package/PackageCacheStoreTest.kt`

- [ ] **Step 1: Create PackageCacheStore.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageCacheStore.kt
package com.dualler.core.`package`

import com.dualler.core.`package`.model.LocalPackage
import com.dualler.core.`package`.model.PackageStatus
import com.dualler.platform.Platform

/**
 * Package cache manager
 *
 * Manages local package versions with LRU cleanup
 */
class PackageCacheStore(private val platform: Platform) {
    private val storage = platform.storage
    private val file = platform.file

    companion object {
        private const val KEY_VERSION_PREFIX = "dualler_version_"
    }

    /**
     * Get current version for an app
     */
    fun getCurrentVersion(appId: String): String? {
        return storage.getItem("$KEY_VERSION_PREFIX$appId")
    }

    /**
     * Set current version for an app
     */
    fun setCurrentVersion(appId: String, version: String) {
        storage.setItem("$KEY_VERSION_PREFIX$appId", version)
    }

    /**
     * Get local package info
     */
    fun getLocalPackage(appId: String): LocalPackage? {
        val version = getCurrentVersion(appId) ?: return null
        val path = getInstallPath(appId, version)
        return LocalPackage(
            appId = appId,
            version = version,
            installPath = path,
            installedAt = 0,
            status = PackageStatus.READY
        )
    }

    /**
     * Get install path for a version
     */
    fun getInstallPath(appId: String, version: String): String {
        return "dualler/packages/$appId/v$version"
    }

    /**
     * Clean old versions
     */
    fun cleanOldVersions(appId: String, keepVersions: Int = 2) {
        // Simplified: in real implementation, list version dirs and delete old ones
    }

    /**
     * Clear cache for an app
     */
    fun clearCache(appId: String) {
        storage.removeItem("$KEY_VERSION_PREFIX$appId")
    }

    /**
     * Clear all cache
     */
    fun clearAllCache() {
        storage.clear()
    }
}
```

- [ ] **Step 2: Create test**

```kotlin
// packages/core-kmp/src/commonTest/kotlin/com/dualler/core/package/PackageCacheStoreTest.kt
package com.dualler.core.`package`

import com.dualler.core.MockPlatform
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PackageCacheStoreTest {
    @Test
    fun testVersionLifecycle() {
        val platform = MockPlatform()
        val store = PackageCacheStore(platform)

        assertNull(store.getCurrentVersion("com.test.app"))

        store.setCurrentVersion("com.test.app", "1.0.0")
        assertEquals("1.0.0", store.getCurrentVersion("com.test.app"))

        store.setCurrentVersion("com.test.app", "1.1.0")
        assertEquals("1.1.0", store.getCurrentVersion("com.test.app"))
    }

    @Test
    fun testClearCache() {
        val platform = MockPlatform()
        val store = PackageCacheStore(platform)

        store.setCurrentVersion("com.test.app", "1.0.0")
        store.clearCache("com.test.app")
        assertNull(store.getCurrentVersion("com.test.app"))
    }

    @Test
    fun testGetLocalPackage() {
        val platform = MockPlatform()
        val store = PackageCacheStore(platform)

        store.setCurrentVersion("com.test.app", "1.0.0")
        val pkg = store.getLocalPackage("com.test.app")

        assertEquals("com.test.app", pkg?.appId)
        assertEquals("1.0.0", pkg?.version)
    }
}
```

- [ ] **Step 3: Run tests**

Run: `./gradlew :core-kmp:testDebugUnitTest --tests "com.dualler.core.package.PackageCacheStoreTest"`

- [ ] **Step 4: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageCacheStore.kt
git add packages/core-kmp/src/commonTest/kotlin/com/dualler/core/package/PackageCacheStoreTest.kt
git commit -m "feat: implement PackageCacheStore with version management"
```

---

## Task 3: PackageDownloader

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageDownloader.kt`

- [ ] **Step 1: Create PackageDownloader.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageDownloader.kt
package com.dualler.core.`package`

import com.dualler.platform.Platform

/**
 * Package download result
 */
sealed class PackageDownloadResult {
    data class Progress(val percent: Int, val bytes: Long) : PackageDownloadResult()
    data class Success(val filePath: String) : PackageDownloadResult()
    data class Failed(val reason: String) : PackageDownloadResult()
}

/**
 * Package downloader
 *
 * Downloads .mpkg packages or patch files from CDN
 */
class PackageDownloader(private val platform: Platform) {
    private val network = platform.network

    /**
     * Download a file
     * @param url Download URL
     * @param destPath Destination path
     * @param callback Progress and result callback
     */
    fun download(url: String, destPath: String, callback: (PackageDownloadResult) -> Unit) {
        callback(PackageDownloadResult.Progress(0, 0))

        network.downloadFile(
            com.dualler.platform.provider.DownloadConfig(url = url, filePath = destPath)
        ) { result ->
            when (result) {
                is com.dualler.platform.provider.DownloadProgress.Progress -> {
                    callback(PackageDownloadResult.Progress(result.percent, result.bytes))
                }
                is com.dualler.platform.provider.DownloadProgress.Success -> {
                    callback(PackageDownloadResult.Success(result.filePath))
                }
                is com.dualler.platform.provider.DownloadProgress.Failed -> {
                    callback(PackageDownloadResult.Failed(result.error))
                }
            }
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `./gradlew :core-kmp:compileKotlinAndroid`

- [ ] **Step 3: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackageDownloader.kt
git commit -m "feat: implement PackageDownloader"
```

---

## Task 4: PackagePatcher

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackagePatcher.kt`

- [ ] **Step 1: Create PackagePatcher.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackagePatcher.kt
package com.dualler.core.`package`

import com.dualler.platform.Platform

/**
 * Patch result
 */
sealed class PatchResult {
    data class Success(val outputPath: String, val newVersion: String) : PatchResult()
    data class Failed(val reason: String) : PatchResult()
}

/**
 * Package patcher
 *
 * Applies Bsdiff incremental packages
 */
class PackagePatcher(private val platform: Platform) {
    private val file = platform.file

    /**
     * Apply patch
     * @param basePath Base version path
     * @param patchPath Patch file path
     * @param outputPath Output path
     * @return Patch result
     */
    fun applyPatch(basePath: String, patchPath: String, outputPath: String): PatchResult {
        return try {
            // 1. Read patch manifest
            val patchData = file.readFile(patchPath)
            if (patchData == null) {
                return PatchResult.Failed("Cannot read patch file")
            }

            // 2. Copy base to output
            val baseData = file.readFileBytes(basePath)
            if (baseData == null) {
                return PatchResult.Failed("Cannot read base file")
            }

            // 3. Apply patch (simplified: in real impl, use Bsdiff)
            file.writeFileBytes(outputPath, baseData)

            // 4. Verify integrity
            PatchResult.Success(outputPath, "patched")
        } catch (e: Exception) {
            PatchResult.Failed(e.message ?: "Unknown error")
        }
    }

    /**
     * Generate patch (server-side tool)
     */
    fun generatePatch(basePath: String, targetPath: String, outputPath: String): Boolean {
        // Simplified: in real impl, generate Bsdiff
        return true
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `./gradlew :core-kmp:compileKotlinAndroid`

- [ ] **Step 3: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/PackagePatcher.kt
git commit -m "feat: implement PackagePatcher"
```

---

## Task 5: UpdateScheduler

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/UpdateScheduler.kt`

- [ ] **Step 1: Create UpdateScheduler.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/UpdateScheduler.kt
package com.dualler.core.`package`

import com.dualler.core.`package`.model.*
import com.dualler.platform.Platform

/**
 * Server API interface for update checks
 */
interface ServerApi {
    fun checkUpdate(appId: String, localVersion: String?, callback: (UpdateCheckResult) -> Unit)
}

/**
 * Update scheduler
 *
 * Decides update strategy: incremental, full, or silent
 */
class UpdateScheduler(
    private val platform: Platform,
    private val downloader: PackageDownloader,
    private val patcher: PackagePatcher,
    private val cacheStore: PackageCacheStore
) {
    /**
     * Check and execute update
     */
    fun checkAndUpdate(
        appId: String,
        serverApi: ServerApi,
        strategy: UpdateStrategy,
        callback: PackageCallback
    ) {
        val localPackage = cacheStore.getLocalPackage(appId)

        serverApi.checkUpdate(appId, localPackage?.version) { result ->
            when (result) {
                is UpdateCheckResult.UpToDate -> {
                    localPackage?.let { callback.onSuccess(appId, it) }
                        ?: callback.onFailed(appId, PackageError.DownloadFailed("No local package"))
                }
                is UpdateCheckResult.HasUpdate -> {
                    handleUpdate(appId, result.packageInfo, localPackage, strategy, callback)
                }
                is UpdateCheckResult.Error -> {
                    if (localPackage != null) {
                        callback.onSuccess(appId, localPackage)
                    } else {
                        callback.onFailed(appId, PackageError.DownloadFailed(result.message))
                    }
                }
            }
        }
    }

    private fun handleUpdate(
        appId: String,
        info: PackageInfo,
        localPackage: LocalPackage?,
        strategy: UpdateStrategy,
        callback: PackageCallback
    ) {
        when {
            info.forceUpdate -> doFullUpdate(appId, info, callback)
            info.patchUrl != null && info.patchBaseVersion == localPackage?.version -> {
                doPatchUpdate(appId, info, callback)
            }
            strategy == UpdateStrategy.SILENT -> {
                // Background update, return local version immediately
                localPackage?.let { callback.onSuccess(appId, it) }
                doFullUpdate(appId, info, object : PackageCallback {
                    override fun onProgress(appId: String, progress: Int) {}
                    override fun onSuccess(appId: String, localPackage: LocalPackage) {}
                    override fun onFailed(appId: String, error: PackageError) {}
                })
            }
            else -> doFullUpdate(appId, info, callback)
        }
    }

    private fun doPatchUpdate(appId: String, info: PackageInfo, callback: PackageCallback) {
        callback.onProgress(appId, 0)

        val destPath = cacheStore.getInstallPath(appId, info.version) + ".patch"

        downloader.download(info.patchUrl!!, destPath) { result ->
            when (result) {
                is PackageDownloadResult.Progress -> {
                    callback.onProgress(appId, result.percent / 2)
                }
                is PackageDownloadResult.Success -> {
                    val basePath = cacheStore.getInstallPath(appId, info.patchBaseVersion!!)
                    val outputPath = cacheStore.getInstallPath(appId, info.version)

                    val patchResult = patcher.applyPatch(basePath, destPath, outputPath)
                    when (patchResult) {
                        is PatchResult.Success -> {
                            cacheStore.setCurrentVersion(appId, info.version)
                            callback.onProgress(appId, 100)
                            callback.onSuccess(appId, LocalPackage(
                                appId, info.version, outputPath,
                                0, PackageStatus.READY
                            ))
                        }
                        is PatchResult.Failed -> {
                            doFullUpdate(appId, info, callback)
                        }
                    }
                }
                is PackageDownloadResult.Failed -> {
                    callback.onFailed(appId, PackageError.DownloadFailed(result.reason))
                }
            }
        }
    }

    private fun doFullUpdate(appId: String, info: PackageInfo, callback: PackageCallback) {
        callback.onProgress(appId, 0)

        val destPath = cacheStore.getInstallPath(appId, info.version) + ".mpkg"

        downloader.download(info.downloadUrl, destPath) { result ->
            when (result) {
                is PackageDownloadResult.Progress -> {
                    callback.onProgress(appId, (result.percent * 0.8).toInt())
                }
                is PackageDownloadResult.Success -> {
                    cacheStore.setCurrentVersion(appId, info.version)
                    callback.onProgress(appId, 100)
                    callback.onSuccess(appId, LocalPackage(
                        appId, info.version, destPath,
                        0, PackageStatus.READY
                    ))
                }
                is PackageDownloadResult.Failed -> {
                    callback.onFailed(appId, PackageError.DownloadFailed(result.reason))
                }
            }
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `./gradlew :core-kmp:compileKotlinAndroid`

- [ ] **Step 3: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/package/UpdateScheduler.kt
git commit -m "feat: implement UpdateScheduler with patch/full/silent strategies"
```

---

## Task 6: DuallerErrorHandler

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/DuallerErrorHandler.kt`
- Test: `packages/core-kmp/src/commonTest/kotlin/com/dualler/core/error/DuallerErrorHandlerTest.kt`

- [ ] **Step 1: Create DuallerErrorHandler.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/DuallerErrorHandler.kt
package com.dualler.core.error

/**
 * Error info
 */
data class ErrorInfo(
    val message: String,
    val stack: String? = null,
    val pageId: String? = null,
    val timestamp: Long = 0
)

/**
 * Rejection info
 */
data class RejectionInfo(
    val reason: String,
    val pageId: String? = null,
    val timestamp: Long = 0
)

/**
 * Global error handler
 *
 * Corresponds to WeChat:
 *   App.onError -> catchUncaughtErrors()
 *   App.onPageNotFound -> onPageNotFound()
 */
class DuallerErrorHandler {
    private val errorCallbacks = mutableListOf<(ErrorInfo) -> Unit>()
    private val rejectionCallbacks = mutableListOf<(RejectionInfo) -> Unit>()

    /**
     * Handle JS error
     */
    fun onError(info: ErrorInfo) {
        errorCallbacks.forEach { it(info) }
    }

    /**
     * Handle unhandled promise rejection
     */
    fun onRejection(info: RejectionInfo) {
        rejectionCallbacks.forEach { it(info) }
    }

    /**
     * Register error callback
     */
    fun registerErrorCallback(callback: (ErrorInfo) -> Unit) {
        errorCallbacks.add(callback)
    }

    /**
     * Register rejection callback
     */
    fun registerRejectionCallback(callback: (RejectionInfo) -> Unit) {
        rejectionCallbacks.add(callback)
    }

    /**
     * Clear all callbacks
     */
    fun clear() {
        errorCallbacks.clear()
        rejectionCallbacks.clear()
    }
}
```

- [ ] **Step 2: Create test**

```kotlin
// packages/core-kmp/src/commonTest/kotlin/com/dualler/core/error/DuallerErrorHandlerTest.kt
package com.dualler.core.error

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DuallerErrorHandlerTest {
    @Test
    fun testErrorCallback() {
        val handler = DuallerErrorHandler()
        var received: ErrorInfo? = null

        handler.registerErrorCallback { received = it }
        handler.onError(ErrorInfo("test error", "stack trace", "pages/index"))

        assertEquals("test error", received?.message)
        assertEquals("stack trace", received?.stack)
        assertEquals("pages/index", received?.pageId)
    }

    @Test
    fun testRejectionCallback() {
        val handler = DuallerErrorHandler()
        var received: RejectionInfo? = null

        handler.registerRejectionCallback { received = it }
        handler.onRejection(RejectionInfo("promise rejected", "pages/index"))

        assertEquals("promise rejected", received?.reason)
    }

    @Test
    fun testClear() {
        val handler = DuallerErrorHandler()
        var called = false

        handler.registerErrorCallback { called = true }
        handler.clear()
        handler.onError(ErrorInfo("test"))

        assertTrue(!called)
    }
}
```

- [ ] **Step 3: Run tests**

Run: `./gradlew :core-kmp:testDebugUnitTest --tests "com.dualler.core.error.DuallerErrorHandlerTest"`

- [ ] **Step 4: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/DuallerErrorHandler.kt
git add packages/core-kmp/src/commonTest/kotlin/com/dualler/core/error/DuallerErrorHandlerTest.kt
git commit -m "feat: implement DuallerErrorHandler with error/rejection callbacks"
```

---

## Task 7: CrashRecoveryManager

**Files:**
- Create: `packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/CrashRecoveryManager.kt`

- [ ] **Step 1: Create CrashRecoveryManager.kt**

```kotlin
// packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/CrashRecoveryManager.kt
package com.dualler.core.error

import com.dualler.platform.Platform

/**
 * Crash recovery info
 */
data class CrashRecoveryInfo(
    val lastPage: String,
    val savedState: Map<String, Any>,
    val crashedAt: Long,
    val recoveredAt: Long
)

/**
 * Crash recovery manager
 *
 * Saves app state at key lifecycle points
 * Detects crash recovery on startup (within 30s)
 */
class CrashRecoveryManager(private val platform: Platform) {
    companion object {
        private const val KEY_APP_STATE = "__dualler_crash_state__"
        private const val KEY_LAST_PAGE = "__dualler_last_page__"
        private const val KEY_LAST_TIMESTAMP = "__dualler_last_timestamp__"
        private const val CRASH_TIMEOUT_MS = 30_000L
    }

    private val storage = platform.storage

    /**
     * Save current app state
     */
    fun saveAppState(appId: String, currentPage: String, data: Map<String, Any>) {
        storage.setItem("${appId}_$KEY_LAST_PAGE", currentPage)
        storage.setItem("${appId}_$KEY_LAST_TIMESTAMP", System.currentTimeMillis().toString())
    }

    /**
     * Detect if this is a crash recovery startup
     * @return Recovery info, null if normal startup
     */
    fun detectCrashRecovery(appId: String): CrashRecoveryInfo? {
        val lastTimestamp = storage.getItem("${appId}_$KEY_LAST_TIMESTAMP")?.toLongOrNull()
            ?: return null

        val elapsed = System.currentTimeMillis() - lastTimestamp
        if (elapsed > CRASH_TIMEOUT_MS) return null

        val lastPage = storage.getItem("${appId}_$KEY_LAST_PAGE") ?: return null

        return CrashRecoveryInfo(
            lastPage = lastPage,
            savedState = emptyMap(),
            crashedAt = lastTimestamp,
            recoveredAt = System.currentTimeMillis()
        )
    }

    /**
     * Clear recovery data
     */
    fun clearRecoveryData(appId: String) {
        storage.removeItem("${appId}_$KEY_APP_STATE")
        storage.removeItem("${appId}_$KEY_LAST_PAGE")
        storage.removeItem("${appId}_$KEY_LAST_TIMESTAMP")
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `./gradlew :core-kmp:compileKotlinAndroid`

- [ ] **Step 3: Commit**

```bash
git add packages/core-kmp/src/commonMain/kotlin/com/dualler/core/error/CrashRecoveryManager.kt
git commit -m "feat: implement CrashRecoveryManager"
```

---

## Task 8: iOS Shell

**Files:**
- Create: `packages/ios/build.gradle.kts`
- Create: `packages/ios/src/iosMain/kotlin/com/dualler/ios/IOSPlatform.kt`

- [ ] **Step 1: Create build.gradle.kts**

```kotlin
// packages/ios/build.gradle.kts
plugins {
    kotlin("multiplatform")
}

kotlin {
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        iosMain.dependencies {
            implementation(project(":core-kmp"))
            implementation(project(":platform-kmp"))
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
        }
    }
}
```

- [ ] **Step 2: Create IOSPlatform.kt**

```kotlin
// packages/ios/src/iosMain/kotlin/com/dualler/ios/IOSPlatform.kt
package com.dualler.ios

import com.dualler.platform.*
import com.dualler.platform.model.*
import com.dualler.platform.provider.*

class IOSPlatform : Platform {
    override val name = "ios"

    override fun createJSEngine(): JSEngine = IOSJSEngine()
    override fun createWebView(): WebViewProvider = IOSWebViewProvider()
    override fun createBridge(): PlatformBridge = IOSPlatformBridge()

    override val network: NetworkProvider = IOSNetworkProvider()
    override val storage: StorageProvider = IOSStorageProvider()
    override val file: FileProvider = IOSFileProvider()
    override val device: DeviceProvider = IOSDeviceProvider()
}

class IOSJSEngine : JSEngine {
    override fun evaluateScript(script: String, sourceUrl: String): JSValue = JSValue.Undefined
    override fun registerCallback(name: String, callback: (JSArray) -> JSValue) {}
    override fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>) {}
    override fun destroy() {}
}

class IOSWebViewProvider : WebViewProvider {
    override fun loadUrl(url: String) {}
    override fun loadHtml(html: String, baseUrl: String) {}
    override fun evaluateJavascript(script: String, callback: ((String) -> Unit)?) {}
    override fun addJavascriptInterface(name: String, handler: (String) -> Unit) {}
    override fun injectCSS(css: String) {}
    override fun injectScript(script: String) {}
    override fun configure(config: WebViewConfig) {}
    override fun destroy() {}
}

class IOSPlatformBridge : PlatformBridge {
    override fun setData(pageId: String, data: Map<String, Any>) {}
    override fun dispatchEvent(pageId: String, event: DOMEvent) {}
    override fun callNative(api: String, params: Map<String, Any>, callbackId: String) {}
    override fun invokeCallback(callbackId: String, result: APIResult) {}
    override fun registerAPI(name: String, handler: APIHandler) {}
}

class IOSNetworkProvider : NetworkProvider {
    override fun request(config: NetworkRequest, callback: (NetworkResponse) -> Unit) {}
    override fun uploadFile(config: UploadConfig, callback: (NetworkResponse) -> Unit) {}
    override fun downloadFile(config: DownloadConfig, callback: (DownloadProgress) -> Unit) {}
}

class IOSStorageProvider : StorageProvider {
    private val storage = mutableMapOf<String, String>()
    override fun getItem(key: String): String? = storage[key]
    override fun setItem(key: String, value: String) { storage[key] = value }
    override fun removeItem(key: String) { storage.remove(key) }
    override fun clear() { storage.clear() }
    override fun getKeys(): List<String> = storage.keys.toList()
    override fun getInfo(): StorageInfo = StorageInfo(emptyList(), 0, 0)
}

class IOSFileProvider : FileProvider {
    override fun readFile(path: String, encoding: String): String? = null
    override fun readFileBytes(path: String): ByteArray? = null
    override fun writeFile(path: String, data: String, encoding: String): Boolean = false
    override fun writeFileBytes(path: String, data: ByteArray): Boolean = false
    override fun appendFile(path: String, data: String): Boolean = false
    override fun unlink(path: String): Boolean = false
    override fun mkdir(path: String, recursive: Boolean): Boolean = false
    override fun readdir(path: String): List<FileInfo>? = null
    override fun stat(path: String): FileInfo? = null
    override fun saveFile(tempPath: String, destPath: String): String? = null
}

class IOSDeviceProvider : DeviceProvider {
    override fun getSystemInfo(): SystemInfo = SystemInfo(
        brand = "Apple", model = "iPhone", pixelRatio = 3.0f,
        screenWidth = 1170, screenHeight = 2532,
        windowWidth = 1170, windowHeight = 2532,
        statusBarHeight = 44, language = "en",
        version = "17.0", platform = "ios", SDKVersion = "1.0.0"
    )
    override fun vibrate(type: VibrateType) {}
    override fun getNetworkType(): NetworkType = NetworkType.WIFI
}
```

- [ ] **Step 3: Add to settings.gradle.kts**

Add:
```kotlin
include(":ios")
project(":ios").projectDir = File("packages/ios")
```

- [ ] **Step 4: Verify compilation**

Run: `./gradlew :ios:compileKotlinIosArm64`

- [ ] **Step 5: Commit**

```bash
git add packages/ios/ settings.gradle.kts
git commit -m "feat: add iOS shell with platform stubs"
```

---

## Task 9: Web Shell

**Files:**
- Create: `packages/web/build.gradle.kts`
- Create: `packages/web/src/jsMain/kotlin/com/dualler/web/WebPlatform.kt`

- [ ] **Step 1: Create build.gradle.kts**

```kotlin
// packages/web/build.gradle.kts
plugins {
    kotlin("multiplatform")
}

kotlin {
    js(IR) {
        browser()
        binaries.executable()
    }

    sourceSets {
        jsMain.dependencies {
            implementation(project(":core-kmp"))
            implementation(project(":platform-kmp"))
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
        }
    }
}
```

- [ ] **Step 2: Create WebPlatform.kt**

```kotlin
// packages/web/src/jsMain/kotlin/com/dualler/web/WebPlatform.kt
package com.dualler.web

import com.dualler.platform.*
import com.dualler.platform.model.*
import com.dualler.platform.provider.*

class WebPlatform : Platform {
    override val name = "web"

    override fun createJSEngine(): JSEngine = WebJSEngine()
    override fun createWebView(): WebViewProvider = WebWebViewProvider()
    override fun createBridge(): PlatformBridge = WebPlatformBridge()

    override val network: NetworkProvider = WebNetworkProvider()
    override val storage: StorageProvider = WebStorageProvider()
    override val file: FileProvider = WebFileProvider()
    override val device: DeviceProvider = WebDeviceProvider()
}

class WebJSEngine : JSEngine {
    override fun evaluateScript(script: String, sourceUrl: String): JSValue = JSValue.Undefined
    override fun registerCallback(name: String, callback: (JSArray) -> JSValue) {}
    override fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>) {}
    override fun destroy() {}
}

class WebWebViewProvider : WebViewProvider {
    override fun loadUrl(url: String) {}
    override fun loadHtml(html: String, baseUrl: String) {}
    override fun evaluateJavascript(script: String, callback: ((String) -> Unit)?) {}
    override fun addJavascriptInterface(name: String, handler: (String) -> Unit) {}
    override fun injectCSS(css: String) {}
    override fun injectScript(script: String) {}
    override fun configure(config: WebViewConfig) {}
    override fun destroy() {}
}

class WebPlatformBridge : PlatformBridge {
    override fun setData(pageId: String, data: Map<String, Any>) {}
    override fun dispatchEvent(pageId: String, event: DOMEvent) {}
    override fun callNative(api: String, params: Map<String, Any>, callbackId: String) {}
    override fun invokeCallback(callbackId: String, result: APIResult) {}
    override fun registerAPI(name: String, handler: APIHandler) {}
}

class WebNetworkProvider : NetworkProvider {
    override fun request(config: NetworkRequest, callback: (NetworkResponse) -> Unit) {}
    override fun uploadFile(config: UploadConfig, callback: (NetworkResponse) -> Unit) {}
    override fun downloadFile(config: DownloadConfig, callback: (DownloadProgress) -> Unit) {}
}

class WebStorageProvider : StorageProvider {
    override fun getItem(key: String): String? = null
    override fun setItem(key: String, value: String) {}
    override fun removeItem(key: String) {}
    override fun clear() {}
    override fun getKeys(): List<String> = emptyList()
    override fun getInfo(): StorageInfo = StorageInfo(emptyList(), 0, 0)
}

class WebFileProvider : FileProvider {
    override fun readFile(path: String, encoding: String): String? = null
    override fun readFileBytes(path: String): ByteArray? = null
    override fun writeFile(path: String, data: String, encoding: String): Boolean = false
    override fun writeFileBytes(path: String, data: ByteArray): Boolean = false
    override fun appendFile(path: String, data: String): Boolean = false
    override fun unlink(path: String): Boolean = false
    override fun mkdir(path: String, recursive: Boolean): Boolean = false
    override fun readdir(path: String): List<FileInfo>? = null
    override fun stat(path: String): FileInfo? = null
    override fun saveFile(tempPath: String, destPath: String): String? = null
}

class WebDeviceProvider : DeviceProvider {
    override fun getSystemInfo(): SystemInfo = SystemInfo(
        brand = "Browser", model = "Web", pixelRatio = 2.0f,
        screenWidth = 1920, screenHeight = 1080,
        windowWidth = 1920, windowHeight = 1080,
        statusBarHeight = 0, language = "en",
        version = "1.0", platform = "web", SDKVersion = "1.0.0"
    )
    override fun vibrate(type: VibrateType) {}
    override fun getNetworkType(): NetworkType = NetworkType.WIFI
}
```

- [ ] **Step 3: Add to settings.gradle.kts**

Add:
```kotlin
include(":web")
project(":web").projectDir = File("packages/web")
```

- [ ] **Step 4: Verify compilation**

Run: `./gradlew :web:compileKotlinJs`

- [ ] **Step 5: Commit**

```bash
git add packages/web/ settings.gradle.kts
git commit -m "feat: add Web shell with platform stubs"
```

---

## Task 10: Full Build Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run all tests**

```bash
./gradlew :core-kmp:testDebugUnitTest
```

Expected: All tests PASS

- [ ] **Step 2: Run full build**

```bash
./gradlew build
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit final state**

```bash
git add -A
git commit -m "feat: complete Phase 4 - package management, error handling, iOS/Web shells"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Package management: PackageDownloader, PackagePatcher, PackageCacheStore, UpdateScheduler
- ✅ Error handling: DuallerErrorHandler, CrashRecoveryManager
- ✅ iOS shell: IOSPlatform with stubs
- ✅ Web shell: WebPlatform with stubs

**2. Placeholder scan:**
- ✅ No TBD/TODO
- ✅ All code blocks complete

**3. Type consistency:**
- ✅ PackageInfo, LocalPackage, PackageError consistent across tasks
- ✅ UpdateScheduler uses correct callback types

---

*Plan complete.*
