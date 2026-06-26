package com.dualler.platform

/**
 * WebView container abstraction
 * Implementations: AndroidWebViewProvider, WKWebViewProvider, ShadowDOMWebView
 */
interface WebViewProvider {
    /** Load URL */
    fun loadUrl(url: String)

    /** Load HTML content */
    fun loadHtml(html: String, baseUrl: String = "")

    /** Execute JS in WebView */
    fun evaluateJavascript(script: String, callback: ((String) -> Unit)? = null)

    /** Inject JS interface object */
    fun addJavascriptInterface(name: String, handler: (String) -> Unit)

    /** Inject CSS styles */
    fun injectCSS(css: String)

    /** Inject JS file */
    fun injectScript(script: String)

    /** Configure WebView settings */
    fun configure(config: WebViewConfig)

    /** Set WebView visibility (for page show/hide) */
    fun setVisible(visible: Boolean)

    /** Destroy WebView */
    fun destroy()
}

/**
 * WebView configuration
 */
data class WebViewConfig(
    val javaScriptEnabled: Boolean = true,
    val domStorageEnabled: Boolean = true,
    val allowFileAccess: Boolean = false,
    val allowFileAccessFromFileURLs: Boolean = false,
    val allowUniversalAccessFromFileURLs: Boolean = false,
    val allowContentAccess: Boolean = false,
    val cacheMode: Int = 0,
    val userAgent: String? = null,
    val virtualDomain: String = "dualler.local"
)