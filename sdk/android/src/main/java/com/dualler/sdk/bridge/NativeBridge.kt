package com.dualler.sdk.bridge

import com.dualler.sdk.engine.QuickJsEngine
import com.dualler.sdk.view.DuallerWebView

/**
 * Bridges JavaScript engine and Native handlers.
 * JS calls -> NativeBridge -> Handler -> response -> JS callback
 */
class NativeBridge(
    private val webView: DuallerWebView,
    private val jsEngine: QuickJsEngine
) {
    fun callJSFromNative(jsCode: String) {
        webView.evaluateJavascript(jsCode, null)
    }

    fun callNativeFromJS(apiName: String, args: Map<String, Any>, callbackId: String?) {
        // This is handled by BridgeManager -> Router -> Handler
    }
}
