package com.dualler.android

import android.content.Context
import com.dualler.android.bridge.AndroidPlatformBridge
import com.dualler.android.engine.AndroidJSEngine
import com.dualler.android.webview.AndroidWebViewProvider
import com.dualler.platform.JSEngine
import com.dualler.platform.Platform
import com.dualler.platform.PlatformBridge
import com.dualler.platform.WebViewProvider
import com.dualler.platform.provider.*

class AndroidPlatform(private val context: Context) : Platform {
    override val name = "android"

    override fun createJSEngine(): JSEngine = AndroidJSEngine()

    override fun createWebView(): WebViewProvider = AndroidWebViewProvider(context)

    override fun createBridge(): PlatformBridge = AndroidPlatformBridge(context)

    override val network: NetworkProvider = AndroidNetworkProvider(context)
    override val storage: StorageProvider = AndroidStorageProvider(context)
    override val file: FileProvider = AndroidFileProvider(context)
    override val device: DeviceProvider = AndroidDeviceProvider(context)
}

class AndroidNetworkProvider(private val context: Context) : NetworkProvider {
    override fun request(config: NetworkRequest, callback: (NetworkResponse) -> Unit) {}
    override fun uploadFile(config: UploadConfig, callback: (NetworkResponse) -> Unit) {}
    override fun downloadFile(config: DownloadConfig, callback: (DownloadProgress) -> Unit) {}
}

class AndroidStorageProvider(private val context: Context) : StorageProvider {
    private val prefs = context.getSharedPreferences("dualler", Context.MODE_PRIVATE)
    override fun getItem(key: String): String? = prefs.getString(key, null)
    override fun setItem(key: String, value: String) { prefs.edit().putString(key, value).apply() }
    override fun removeItem(key: String) { prefs.edit().remove(key).apply() }
    override fun clear() { prefs.edit().clear().apply() }
    override fun getKeys(): List<String> = prefs.all.keys.toList()
    override fun getInfo(): StorageInfo = StorageInfo(prefs.all.keys.toList(), 0, 10 * 1024 * 1024)
}

class AndroidFileProvider(private val context: Context) : FileProvider {
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

class AndroidDeviceProvider(private val context: Context) : DeviceProvider {
    override fun getSystemInfo(): SystemInfo = SystemInfo(
        brand = android.os.Build.BRAND,
        model = android.os.Build.MODEL,
        pixelRatio = context.resources.displayMetrics.density,
        screenWidth = context.resources.displayMetrics.widthPixels,
        screenHeight = context.resources.displayMetrics.heightPixels,
        windowWidth = context.resources.displayMetrics.widthPixels,
        windowHeight = context.resources.displayMetrics.heightPixels,
        statusBarHeight = 0,
        language = java.util.Locale.getDefault().language,
        version = android.os.Build.VERSION.RELEASE,
        platform = "android",
        SDKVersion = "1.0.0"
    )
    override fun vibrate(type: VibrateType) {}
    override fun getNetworkType(): NetworkType = NetworkType.WIFI
}
