package com.dualler.core

import com.dualler.platform.Platform

/**
 * Page-level runtime
 */
class PageRuntime(
    val pageId: String,
    private val platform: Platform
) {
    private val webView = platform.createWebView()
    private var state = PageState.LOADING

    fun load(query: Map<String, String> = emptyMap()) {
        val html = platform.file.readFile("$pageId.html") ?: ""
        webView.loadHtml(html)
        state = PageState.READY
    }

    fun setData(data: Map<String, Any>) {
        // Will be implemented in later tasks
    }

    fun show() { state = PageState.SHOWING }
    fun hide() { state = PageState.HIDING }
    fun unload() {
        webView.destroy()
        state = PageState.DESTROYED
    }

    fun getState(): PageState = state
}

enum class PageState {
    LOADING, READY, SHOWING, HIDING, DESTROYED
}
