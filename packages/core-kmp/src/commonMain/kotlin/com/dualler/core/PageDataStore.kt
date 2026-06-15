package com.dualler.core

/**
 * Page data cache
 *
 * Solves the white-screen race condition in dual-thread architecture:
 *   When WebView is not ready, logic layer setData data is cached
 *   After WebView ready, flush all cached data at once
 */
object PageDataStore {
    private val pageData = mutableMapOf<String, MutableMap<String, Any>>()

    /**
     * Update page data (merge into existing cache)
     */
    fun updatePageData(pageId: String, data: Map<String, Any>) {
        val existing = pageData.getOrPut(pageId) { mutableMapOf() }
        existing.putAll(data)
    }

    /**
     * Get page full cached data
     */
    fun getPageData(pageId: String): Map<String, Any> {
        return pageData[pageId]?.toMap() ?: emptyMap()
    }

    /**
     * Clear page data
     */
    fun clearPageData(pageId: String) {
        pageData.remove(pageId)
    }

    /**
     * Clear all data
     */
    fun clearAll() {
        pageData.clear()
    }
}
