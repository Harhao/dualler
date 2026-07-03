package com.dualler.sdk.view

import android.annotation.SuppressLint
import android.content.Context
import com.dualler.sdk.EngineConfig
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.JavascriptInterface

@SuppressLint("ViewConstructor")
class DuallerWebView(context: Context, config: EngineConfig, private val pageRoute: String? = null) : WebView(context) {

    init {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        // Inject AndroidBridge as a JS interface so JS can call native methods
        addJavascriptInterface(AndroidBridgeImpl(), "AndroidBridge")

        webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectBridge()
            }
        }

        // If a route is specified, load the page-specific bundle URL.
        val targetUrl = pageRoute?.let { route ->
            resolvePageUrl(route, config.bundleUrl)
        } ?: config.bundleUrl
        loadUrl(targetUrl)
    }

    /**
     * Resolve a page route to its bundle URL based on the base bundleUrl.
     *   pages/index/index → file:///android_asset/dist/pages/index/index.js
     */
    private fun resolvePageUrl(route: String, baseUrl: String): String {
        val pageName = route.split('/').lastOrNull() ?: route
        val distPath = if (baseUrl.contains("/dist/")) {
            baseUrl.substringBefore("/dist/") + "/dist/"
        } else {
            "file:///android_asset/dist/"
        }
        return "${distPath}${route}/${pageName}.js"
    }

    fun loadPage(route: String) {
        val pageName = route.split('/').lastOrNull() ?: route
        val distPath = if (currentUrl?.contains("/dist/") == true) {
            currentUrl!!.substringBefore("/dist/") + "/dist/"
        } else {
            "file:///android_asset/dist/"
        }
        loadUrl("${distPath}${route}/${pageName}.js")
    }

    fun unloadPage() {
        visibility = android.view.View.INVISIBLE
        pauseTimers()
    }

    private fun injectBridge() {
        // Inject JS-side bridge that delegates to AndroidBridge interface
        evaluateJavascript("""
            (function() {
                window.__DUALLER_BRIDGE__ = {
                    postMessage: function(msg) {
                        AndroidBridge.handleMessage(msg);
                    }
                };
            })();
        """.trimIndent(), null)
    }

    fun evaluateJS(script: String, callback: ((String?) -> Unit)?) {
        if (callback == null) {
            evaluateJavascript(script, null)
        } else {
            evaluateJavascript(script) { callback(it) }
        }
    }

    /**
     * JavaScript interface — called from JS via window.__DUALLER_BRIDGE__.postMessage()
     */
    @Suppress("unused")
    inner class AndroidBridgeImpl {
        @JavascriptInterface
        fun handleMessage(message: String): String? {
            // Forward to BridgeManager for routing to handlers
            // This is a simplified bridge — in production, use the BridgeManager
            android.util.Log.d("DuallerBridge", "Received: $message")
            return "{}"
        }
    }
}
