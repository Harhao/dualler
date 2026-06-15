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
