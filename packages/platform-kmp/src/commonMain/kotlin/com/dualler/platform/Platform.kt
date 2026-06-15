package com.dualler.platform

// Temporary stubs - will be replaced in later tasks
interface WebViewProvider
interface PlatformBridge
interface NetworkProvider
interface StorageProvider
interface FileProvider
interface DeviceProvider

/**
 * Platform abstraction interface
 * Each platform provides implementation via expect/actual
 */
interface Platform {
    /** Platform identifier: "android" | "ios" | "web" */
    val name: String

    /** Create JS engine instance */
    fun createJSEngine(): JSEngine

    /** Create WebView container */
    fun createWebView(): WebViewProvider

    /** Create Bridge instance */
    fun createBridge(): PlatformBridge

    /** Network capability */
    val network: NetworkProvider

    /** Storage capability */
    val storage: StorageProvider

    /** File capability */
    val file: FileProvider

    /** Device capability */
    val device: DeviceProvider
}

/**
 * Get current platform instance (expect declaration)
 * Each platform sourceSet provides actual implementation
 */
expect fun getPlatform(): Platform
