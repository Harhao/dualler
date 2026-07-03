package com.dualler.sdk

import android.content.Context
import com.dualler.sdk.bridge.BridgeManager
import com.dualler.sdk.engine.QuickJsEngine
import com.dualler.sdk.view.DuallerWebView
import com.dualler.sdk.view.PageWebViewPool

object DuallerEngine {
    @Volatile private var instance: DuallerWebView? = null
    @Volatile private var pool: PageWebViewPool? = null

    fun init(context: Context, config: EngineConfig): DuallerEngineInstance {
        val webView = DuallerWebView(context, config)
        val bridgeManager = BridgeManager(webView)
        val jsEngine = QuickJsEngine(webView)
        instance = webView

        // Create the page WebView pool.
        val pagePool = PageWebViewPool(context, config)
        pool = pagePool

        return DuallerEngineInstance(webView, bridgeManager, jsEngine, pagePool)
    }

    fun getInstance(): DuallerWebView? = instance

    fun getPool(): PageWebViewPool? = pool

    fun destroy() {
        pool?.clear()
        pool = null
        instance = null
    }
}

data class EngineConfig(
    val debugMode: Boolean = false,
    val bundleUrl: String,
    val errorHandler: ((Throwable) -> Unit)? = null,
    val maxCacheSize: Int = 5
)

data class DuallerEngineInstance(
    val webView: DuallerWebView,
    val bridgeManager: BridgeManager,
    val jsEngine: QuickJsEngine,
    val pool: PageWebViewPool
)
