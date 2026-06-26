package com.dualler.core

import com.dualler.platform.*
import com.dualler.platform.model.*
import com.dualler.platform.provider.*

class MockPlatform : Platform {
    override val name = "mock"
    val jsEngine = MockJSEngine()
    val webView = MockWebViewProvider()
    val bridge = MockPlatformBridge()

    override fun createJSEngine(): JSEngine = jsEngine
    override fun createWebView(): WebViewProvider = webView
    override fun createBridge(): PlatformBridge = bridge
    override val network: NetworkProvider = MockNetworkProvider()
    override val storage: StorageProvider = MockStorageProvider()
    override val file: FileProvider = MockFileProvider()
    override val device: DeviceProvider = MockDeviceProvider()
}

class MockJSEngine : JSEngine {
    val scripts = mutableListOf<String>()
    override fun evaluateScript(script: String, sourceUrl: String): JSValue {
        scripts.add(script)
        return JSValue.Undefined
    }
    override fun registerCallback(name: String, callback: (JSArray) -> JSValue) {}
    override fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>) {}
    override fun destroy() {}
}

class MockWebViewProvider : WebViewProvider {
    var loadedHtml: String? = null
    var isVisible: Boolean = true
    override fun loadUrl(url: String) {}
    override fun loadHtml(html: String, baseUrl: String) { loadedHtml = html }
    override fun evaluateJavascript(script: String, callback: ((String) -> Unit)?) {}
    override fun addJavascriptInterface(name: String, handler: (String) -> Unit) {}
    override fun injectCSS(css: String) {}
    override fun injectScript(script: String) {}
    override fun configure(config: WebViewConfig) {}
    override fun setVisible(visible: Boolean) { isVisible = visible }
    override fun destroy() {}
}

class MockPlatformBridge : PlatformBridge {
    val setDataCalls = mutableListOf<Pair<String, Map<String, Any>>>()
    override fun setData(pageId: String, data: Map<String, Any>) {
        setDataCalls.add(pageId to data)
    }
    override fun dispatchEvent(pageId: String, event: DOMEvent) {}
    override fun callNative(api: String, params: Map<String, Any>, callbackId: String) {}
    override fun invokeCallback(callbackId: String, result: APIResult) {}
    override fun registerAPI(name: String, handler: APIHandler) {}
}

class MockNetworkProvider : NetworkProvider {
    override fun request(config: NetworkRequest, callback: (NetworkResponse) -> Unit) {}
    override fun uploadFile(config: UploadConfig, callback: (NetworkResponse) -> Unit) {}
    override fun downloadFile(config: DownloadConfig, callback: (DownloadProgress) -> Unit) {}
}

class MockStorageProvider : StorageProvider {
    private val storage = mutableMapOf<String, String>()
    override fun getItem(key: String): String? = storage[key]
    override fun setItem(key: String, value: String) { storage[key] = value }
    override fun removeItem(key: String) { storage.remove(key) }
    override fun clear() { storage.clear() }
    override fun getKeys(): List<String> = storage.keys.toList()
    override fun getInfo(): StorageInfo = StorageInfo(emptyList(), 0, 0)
}

class MockFileProvider : FileProvider {
    override fun readFile(path: String, encoding: String): String? = null
    override fun readFileBytes(path: String): ByteArray? = null
    override fun writeFile(path: String, data: String, encoding: String): Boolean = true
    override fun writeFileBytes(path: String, data: ByteArray): Boolean = true
    override fun appendFile(path: String, data: String): Boolean = true
    override fun unlink(path: String): Boolean = true
    override fun mkdir(path: String, recursive: Boolean): Boolean = true
    override fun readdir(path: String): List<FileInfo>? = null
    override fun stat(path: String): FileInfo? = null
    override fun saveFile(tempPath: String, destPath: String): String? = destPath
}

class MockDeviceProvider : DeviceProvider {
    override fun getSystemInfo(): SystemInfo = SystemInfo(
        brand = "Mock", model = "Test", pixelRatio = 2.0f,
        screenWidth = 1080, screenHeight = 1920,
        windowWidth = 1080, windowHeight = 1920,
        statusBarHeight = 24, language = "zh",
        version = "1.0", platform = "mock", SDKVersion = "1.0.0"
    )
    override fun vibrate(type: VibrateType) {}
    override fun getNetworkType(): NetworkType = NetworkType.WIFI
}
