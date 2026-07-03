package com.dualler.sdk

import android.content.Context
import com.dualler.sdk.bridge.BridgeManager
import com.dualler.sdk.engine.QuickJsEngine
import com.dualler.sdk.view.DuallerWebView
import com.dualler.sdk.view.PageWebViewPool

object DuallerEngine {
    @Volatile private var instance: DuallerWebView? = null
    @Volatile private var pool: PageWebViewPool? = null
    @Volatile private var bridgeManager: BridgeManager? = null

    fun init(context: Context, config: EngineConfig): DuallerEngineInstance {
        val webView = DuallerWebView(context, config)
        val bm = BridgeManager(webView)
        val jsEngine = QuickJsEngine(webView)
        instance = webView
        bridgeManager = bm

        // Inject global objects (window.__DUALLER__)
        val adapter = com.dualler.sdk.adapter.JSAdapter(webView)
        adapter.injectGlobalObjects()

        // Create the page WebView pool.
        val pagePool = PageWebViewPool(context, config)
        pool = pagePool

        return DuallerEngineInstance(webView, bm, jsEngine, pagePool)
    }

    fun getInstance(): DuallerWebView? = instance

    fun getPool(): PageWebViewPool? = pool

    fun getBridgeManager(): BridgeManager? = bridgeManager

    fun destroy() {
        pool?.clear()
        pool = null
        bridgeManager = null
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
