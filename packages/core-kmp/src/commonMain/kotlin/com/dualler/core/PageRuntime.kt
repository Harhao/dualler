package com.dualler.core

import com.dualler.platform.Platform
import com.dualler.platform.model.JSValue

/**
 * Page-level runtime
 *
 * Manages a single page's WebView, state, and data synchronization.
 * Each page has its own WebView instance for independent rendering.
 */
class PageRuntime(
    val pageId: String,
    private val platform: Platform
) {
    private val webView = platform.createWebView()
    private var state = PageState.LOADING
    private var query: Map<String, String> = emptyMap()

    /**
     * Load the page HTML into WebView
     */
    fun load(query: Map<String, String> = emptyMap()) {
        this.query = query
        val html = platform.file.readFile("$pageId.html") ?: ""
        webView.loadHtml(html)
        state = PageState.READY

        // Notify page loaded
        webView.evaluateJavascript(
            "if(typeof __dualler_page_onLoad === 'function') __dualler_page_onLoad(${toJson(query)})"
        )
    }

    /**
     * Send data to the page's render layer (setData)
     *
     * This is the core mechanism for logic -> render communication.
     * Data is serialized as JSON and passed to the page's update function.
     */
    fun setData(data: Map<String, Any>) {
        if (state == PageState.DESTROYED) return

        val json = mapToJson(data)
        webView.evaluateJavascript(
            "if(typeof __dualler_page_setData === 'function') __dualler_page_setData($json)"
        )
    }

    /**
     * Show the page (make WebView visible)
     */
    fun show() {
        if (state == PageState.DESTROYED) return
        state = PageState.SHOWING
        webView.setVisible(true)
        webView.evaluateJavascript(
            "if(typeof __dualler_page_onShow === 'function') __dualler_page_onShow()"
        )
    }

    /**
     * Hide the page (make WebView invisible, keep in memory)
     */
    fun hide() {
        if (state == PageState.DESTROYED) return
        state = PageState.HIDING
        webView.setVisible(false)
        webView.evaluateJavascript(
            "if(typeof __dualler_page_onHide === 'function') __dualler_page_onHide()"
        )
    }

    /**
     * Destroy the page and its WebView
     */
    fun unload() {
        webView.evaluateJavascript(
            "if(typeof __dualler_page_onUnload === 'function') __dualler_page_onUnload()"
        )
        webView.destroy()
        state = PageState.DESTROYED
    }

    /**
     * Execute JavaScript in the page's WebView
     */
    fun evaluateScript(script: String) {
        if (state != PageState.DESTROYED) {
            webView.evaluateJavascript(script)
        }
    }

    fun getState(): PageState = state
    fun getQuery(): Map<String, String> = query

    companion object {
        /**
         * Convert Map to JSON string
         */
        private fun mapToJson(map: Map<String, Any>): String {
            val entries = map.entries.joinToString(",") { (key, value) ->
                val escapedKey = key.replace("\"", "\\\"")
                val jsonValue = when (value) {
                    is String -> "\"${value.replace("\"", "\\\"").replace("\n", "\\n")}\""
                    is Number, is Boolean -> value.toString()
                    is Map<*, *> -> {
                        @Suppress("UNCHECKED_CAST")
                        mapToJson(value as Map<String, Any>)
                    }
                    is List<*> -> listToJson(value)
                    else -> "\"${value.toString().replace("\"", "\\\"")}\""
                }
                "\"$escapedKey\":$jsonValue"
            }
            return "{$entries}"
        }

        private fun listToJson(list: List<*>): String {
            val items = list.joinToString(",") { value ->
                when (value) {
                    is String -> "\"${value.replace("\"", "\\\"")}\""
                    is Number, is Boolean -> value.toString()
                    is Map<*, *> -> {
                        @Suppress("UNCHECKED_CAST")
                        mapToJson(value as Map<String, Any>)
                    }
                    else -> "\"${value.toString()}\""
                }
            }
            return "[$items]"
        }

        private fun toJson(map: Map<String, String>): String {
            val entries = map.entries.joinToString(",") { (key, value) ->
                "\"${key.replace("\"", "\\\"")}\":\"${value.replace("\"", "\\\"").replace("\n", "\\n")}\""
            }
            return "{$entries}"
        }
    }
}

enum class PageState {
    LOADING, READY, SHOWING, HIDING, DESTROYED
}
