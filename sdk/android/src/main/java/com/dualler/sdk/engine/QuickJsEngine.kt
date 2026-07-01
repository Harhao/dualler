package com.dualler.sdk.engine

import com.dualler.sdk.view.DuallerWebView

// Simplified QuickJS wrapper -- in production would use quickjs-engine-android or similar
// This is a framework scaffold showing the interface
class QuickJsEngine(private val webView: DuallerWebView) {

    private var contextRef: Any? = null

    fun execute(script: String): Any? {
        // Delegate to WebView's JS evaluation
        var result: Any? = null
        webView.evaluateJavascript(script) { r -> result = parseResult(r) }
        return result
    }

    fun executeAsync(script: String, callback: ((Any?) -> Unit)) {
        webView.evaluateJavascript(script) { r ->
            callback(parseResult(r))
        }
    }

    fun destroy() {
        contextRef = null
    }

    private fun parseResult(json: String?): Any? {
        return json?.trimStart('(')?.trimEnd(')')?.trim()
    }
}
