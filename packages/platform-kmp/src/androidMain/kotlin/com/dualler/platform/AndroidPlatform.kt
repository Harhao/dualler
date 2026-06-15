package com.dualler.platform

import com.dualler.platform.provider.DeviceProvider
import com.dualler.platform.provider.FileProvider
import com.dualler.platform.provider.NetworkProvider
import com.dualler.platform.provider.StorageProvider

/**
 * Android platform stub
 * Full implementation will be added in later tasks
 */
class AndroidPlatformStub : Platform {
    override val name = "android"
    override fun createJSEngine(): JSEngine = throw NotImplementedError()
    override fun createWebView(): WebViewProvider = throw NotImplementedError()
    override fun createBridge(): PlatformBridge = throw NotImplementedError()
    override val network: NetworkProvider = throw NotImplementedError()
    override val storage: StorageProvider = throw NotImplementedError()
    override val file: FileProvider = throw NotImplementedError()
    override val device: DeviceProvider = throw NotImplementedError()
}

private var platformInstance: Platform? = null

actual fun getPlatform(): Platform {
    return platformInstance ?: throw IllegalStateException("Platform not initialized. Call initPlatform() first.")
}

/**
 * Initialize Android platform (call in Application.onCreate)
 */
fun initPlatform(platform: Platform) {
    platformInstance = platform
}
