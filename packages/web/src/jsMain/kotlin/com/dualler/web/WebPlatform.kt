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
