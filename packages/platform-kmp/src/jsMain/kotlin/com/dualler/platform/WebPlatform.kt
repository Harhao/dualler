package com.dualler.platform

import com.dualler.platform.provider.DeviceProvider
import com.dualler.platform.provider.FileProvider
import com.dualler.platform.provider.NetworkProvider
import com.dualler.platform.provider.StorageProvider

/**
 * Web platform stub
 * Full implementation will be added in later tasks
 */
class WebPlatform : Platform {
    override val name = "web"
    override fun createJSEngine(): JSEngine = throw NotImplementedError()
    override fun createWebView(): WebViewProvider = throw NotImplementedError()
    override fun createBridge(): PlatformBridge = throw NotImplementedError()
    override val network: NetworkProvider = throw NotImplementedError()
    override val storage: StorageProvider = throw NotImplementedError()
    override val file: FileProvider = throw NotImplementedError()
    override val device: DeviceProvider = throw NotImplementedError()
}

actual fun getPlatform(): Platform = WebPlatform()
