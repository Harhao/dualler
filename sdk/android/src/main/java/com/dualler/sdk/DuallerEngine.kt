package com.dualler.sdk

import android.content.Context
import com.dualler.sdk.bridge.BridgeManager
import com.dualler.sdk.engine.QuickJsEngine
import com.dualler.sdk.view.DuallerWebView

object DuallerEngine {
    @Volatile private var instance: DuallerWebView? = null

    fun init(context: Context, config: EngineConfig): DuallerEngineInstance {
        val webView = DuallerWebView(context, config)
        val bridgeManager = BridgeManager(webView)
        val jsEngine = QuickJsEngine(webView)
        instance = webView

        return DuallerEngineInstance(webView, bridgeManager, jsEngine)
    }

    fun getInstance(): DuallerWebView? = instance
}

data class EngineConfig(
    val debugMode: Boolean = false,
    val bundleUrl: String,
    val errorHandler: ((Throwable) -> Unit)? = null
)

data class DuallerEngineInstance(
    val webView: DuallerWebView,
    val bridgeManager: BridgeManager,
    val jsEngine: QuickJsEngine
)
