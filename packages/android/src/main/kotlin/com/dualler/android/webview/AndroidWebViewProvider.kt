package com.dualler.android.webview

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import com.dualler.platform.WebViewConfig
import com.dualler.platform.WebViewProvider

/**
 * Android WebView implementation of [WebViewProvider].
 */
class AndroidWebViewProvider(private val context: Context) : WebViewProvider {
    private val webView = WebView(context).apply {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
        }
        webViewClient = WebViewClient()
        webChromeClient = WebChromeClient()
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun loadUrl(url: String) {
        mainHandler.post { webView.loadUrl(url) }
    }

    override fun loadHtml(html: String, baseUrl: String) {
        mainHandler.post {
            val wrappedHtml = wrapHtml(html)
            webView.loadDataWithBaseURL(
                "https://dualler.local",
                wrappedHtml,
                "text/html",
                "UTF-8",
                null
            )
        }
    }

    override fun evaluateJavascript(script: String, callback: ((String) -> Unit)?) {
        mainHandler.post {
            webView.evaluateJavascript(script) { result ->
                callback?.invoke(result ?: "")
            }
        }
    }

    override fun addJavascriptInterface(name: String, handler: (String) -> Unit) {
        webView.addJavascriptInterface(object {
            @JavascriptInterface
            fun postMessage(message: String) {
                handler(message)
            }
        }, name)
    }

    override fun injectCSS(css: String) {
        val escaped = css.replace("'", "\\'").replace("\n", " ")
        evaluateJavascript(
            "var style = document.createElement('style'); style.textContent = '$escaped'; document.head.appendChild(style);"
        )
    }

    override fun injectScript(script: String) {
        evaluateJavascript(script)
    }

    override fun configure(config: WebViewConfig) {
        mainHandler.post {
            webView.settings.javaScriptEnabled = config.javaScriptEnabled
            webView.settings.domStorageEnabled = config.domStorageEnabled
            webView.settings.allowFileAccess = config.allowFileAccess
            config.userAgent?.let { webView.settings.userAgentString = it }
        }
    }

    override fun destroy() {
        mainHandler.post {
            webView.stopLoading()
            webView.destroy()
        }
    }

    /**
     * Returns the underlying Android [WebView] for embedding in a view hierarchy.
     */
    fun getWebView(): WebView = webView

    private fun wrapHtml(html: String): String {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                </style>
            </head>
            <body>
                $html
                <script>
                    window.__dualler_render__ = {
                        patch: function(pageId, data) {
                            for (var key in data) {
                                var elements = document.querySelectorAll('[data-bind-text="' + key + '"]');
                                elements.forEach(function(el) { el.textContent = data[key]; });
                            }
                        }
                    };
                    if (typeof dualler !== 'undefined') {
                        dualler.postMessage(JSON.stringify({ type: 'ready' }));
                    }
                </script>
            </body>
            </html>
        """.trimIndent()
    }
}
