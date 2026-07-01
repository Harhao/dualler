package com.dualler.sdk.view

import android.annotation.SuppressLint
import android.content.Context
import com.dualler.sdk.EngineConfig
import android.webkit.WebView
import android.webkit.WebViewClient

@SuppressLint("ViewConstructor")
class DuallerWebView(context: Context, config: EngineConfig) : WebView(context) {

    init {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }
        webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: android.webkit.WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectBridge()
            }
        }
        loadUrl(config.bundleUrl)
    }

    private fun injectBridge() {
        // Inject JavaScript bridge for Runtime <-> Native communication
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
}
