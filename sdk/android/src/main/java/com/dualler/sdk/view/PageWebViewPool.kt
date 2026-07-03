package com.dualler.sdk.view

import android.content.Context
import android.util.Log
import com.dualler.sdk.EngineConfig

/**
 * LRU-based WebView pool for page reuse.
 *
 * When acquire() is called, returns an existing idle WebView for the route
 * or creates a new one. When release() is called, hides and recycles the
 * WebView back to the pool. If the pool exceeds maxCacheSize, the LRU
 * WebView is destroyed.
 */
class PageWebViewPool(private val context: Context, private val config: EngineConfig) {
    private val TAG = "PageWebViewPool"
    private val _idleMap = mutableMapOf<String, DequeItem>()
    private val _accessOrder = mutableListOf<String>()

    var maxCacheSize: Int = 5

    /** All currently managed WebViews (idle + in-use), for cleanup. */
    private val _allWebViews = mutableMapOf<String, DuallerWebView>()

    /** Acquire a WebView for the given route. Creates one if none idle. */
    fun acquire(route: String): DuallerWebView {
        // Check idle pool first.
        val idle = _idleMap[route]
        if (idle != null) {
            // Move to front of access order (most recently used).
            _accessOrder.removeAll { it == route }
            _accessOrder.add(route)
            Log.d(TAG, "Reusing idle WebView for $route")
            return idle.webView
        }

        Log.d(TAG, "Creating new WebView for $route")
        val webView = DuallerWebView(context, config, route)
        _allWebViews[route] = webView
        _accessOrder.add(route)
        return webView
    }

    /** Release a WebView back to the pool (hide it, mark idle). */
    fun release(route: String, webView: DuallerWebView) {
        webView.visibility = android.view.View.INVISIBLE
        webView.pauseTimers()

        _idleMap[route] = DequeItem(webView)
        Log.d(TAG, "Released WebView for $route to pool")
    }

    /** Destroy the oldest (least recently used) idle WebView. */
    fun destroyOldest() {
        if (_accessOrder.isEmpty()) return
        val oldestRoute = _accessOrder.first()
        _accessOrder.remove(oldestRoute)
        val item = _idleMap.remove(oldestRoute)
        item?.webView?.destroy()
        _allWebViews.remove(oldestRoute)
        Log.d(TAG, "Destroyed oldest WebView for $oldestRoute (LRU)")
    }

    /** Get count of idle WebViews in the pool. */
    fun idleCount(): Int = _idleMap.size

    /** Clear all WebViews from the pool. */
    fun clear() {
        for (item in _idleMap.values) {
            item.webView.destroy()
        }
        _idleMap.clear()
        _allWebViews.clear()
        _accessOrder.clear()
        Log.d(TAG, "Cleared all WebViews from pool")
    }

    private data class DequeItem(val webView: DuallerWebView)
}
