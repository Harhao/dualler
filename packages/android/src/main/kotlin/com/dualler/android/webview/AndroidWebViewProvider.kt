package com.dualler.android.webview

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebMessage
import android.webkit.WebMessagePort
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import com.dualler.platform.WebViewConfig
import com.dualler.platform.WebViewProvider

/**
 * Android WebView implementation of [WebViewProvider].
 *
 * Supports WebMessagePort for efficient bidirectional communication with the WebView.
 * The bridge can call [connectMessagePort] to establish a dedicated message channel,
 * falling back to [addJavascriptInterface] if message ports are unavailable.
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

    // WebMessagePort channel for bidirectional communication
    private var nativePort: WebMessagePort? = null
    private var messageListener: ((String) -> Unit)? = null

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
            nativePort?.close()
            nativePort = null
            webView.stopLoading()
            webView.destroy()
        }
    }

    /**
     * Returns the underlying Android [WebView] for embedding in a view hierarchy.
     */
    fun getWebView(): WebView = webView

    /**
     * Set up a WebMessagePort channel for bidirectional communication.
     * Creates a two-port channel: one port stays native, the other is sent to the WebView.
     * Incoming messages from the WebView are forwarded to [listener].
     *
     * This provides a more efficient and secure alternative to addJavascriptInterface.
     */
    fun connectMessagePort(listener: (String) -> Unit) {
        this.messageListener = listener
        mainHandler.post {
            val channel = webView.createWebMessageChannel()

            // Port 0 stays on the native side
            nativePort = channel[0]
            channel[0].setWebMessageCallback(object : WebMessagePort.WebMessageCallback() {
                override fun onMessage(port: WebMessagePort, message: WebMessage) {
                    val data = message.data ?: return
                    listener(data)
                }
            })

            // Port 1 is transferred to the WebView
            webView.postWebMessage(
                WebMessage("", arrayOf(channel[1])),
                Uri.parse("https://dualler.local")
            )
        }
    }

    /**
     * Send a message to the WebView via the WebMessagePort channel.
     * If the port is not connected, falls back to evaluateJavascript.
     *
     * @param message The message string to send
     */
    fun postMessage(message: String) {
        val port = nativePort
        if (port != null) {
            mainHandler.post {
                port.postMessage(WebMessage(message))
            }
        } else {
            // Fallback: inject script to invoke the global message handler
            evaluateJavascript(
                "typeof window.__duallerOnMessage__ === 'function' && window.__duallerOnMessage__('${message.replace("'", "\\'")}')"
            )
        }
    }

    /**
     * Check if WebMessagePort is connected and available.
     */
    fun isMessagePortConnected(): Boolean = nativePort != null

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
                    // WebMessagePort setup: listen for the port transfer
                    window.addEventListener('message', function(event) {
                        if (event.ports && event.ports.length > 0) {
                            window.__duallerPort__ = event.ports[0];
                            window.__duallerPort__.onmessage = function(msgEvent) {
                                var data = msgEvent.data;
                                if (typeof window.__duallerOnMessage__ === 'function') {
                                    window.__duallerOnMessage__(data);
                                }
                            };
                        }
                    });

                    // Render API for data binding
                    window.__dualler_render__ = {
                        patch: function(pageId, data) {
                            for (var key in data) {
                                var elements = document.querySelectorAll('[data-bind-text="' + key + '"]');
                                elements.forEach(function(el) { el.textContent = data[key]; });
                            }
                        }
                    };

                    // Post message helper: use WebMessagePort if available, fall back to JS interface
                    window.__duallerPostMessage__ = function(message) {
                        if (window.__duallerPort__) {
                            window.__duallerPort__.postMessage(message);
                        } else if (typeof dualler !== 'undefined') {
                            dualler.postMessage(message);
                        }
                    };

                    // Signal ready
                    if (typeof dualler !== 'undefined') {
                        dualler.postMessage(JSON.stringify({ type: 'ready' }));
                    }
                </script>
            </body>
            </html>
        """.trimIndent()
    }
}
