package com.dualler.sdk.adapter

import com.dualler.sdk.view.DuallerWebView
import com.dualler.sdk.BuildConfig

/**
 * WebView adaptation layer -- handles JS <-> Native boundary
 */
class JSAdapter(private val webView: DuallerWebView) {

    fun injectGlobalObjects() {
        webView.evaluateJavascript("""
            window.__DUALLER__ = {
                version: '${BuildConfig.VERSION_NAME}',
                platform: 'android',
                engine: 'quickjs'
            };
        """.trimIndent(), null)
    }

    fun postMessageToNative(message: String) {
        // Called from JS side via AndroidBridge interface
    }
}

// Android side interface accessible from JS
interface AndroidBridgeInterface {
    fun handleMessage(message: String): String?
}
