package com.dualler.core

import com.dualler.platform.Platform

/**
 * Page router manager
 *
 * Page stack rules:
 *   - navigateTo: push, keep current page (max 5 layers)
 *   - redirectTo: replace top of stack
 *   - navigateBack: pop top of stack
 *   - reLaunch: clear stack
 *   - switchTab: switch tab (don't destroy)
 *
 * Stack depth limit: When the stack reaches maxStackSize (default 5),
 * the bottom pages are automatically destroyed to free memory.
 *
 * URL Format: /pages/path/path?key1=value1&key2=value2
 */
class Router(
    private val platform: Platform,
    private val maxStackSize: Int = DEFAULT_MAX_STACK_SIZE
) {
    private val pageStack = mutableListOf<PageRuntime>()
    private var _currentPage: PageRuntime? = null

    val currentPage: PageRuntime? get() = _currentPage
    val currentPath: String get() = _currentPage?.pageId ?: ""
    val stackSize: Int get() = pageStack.size

    /**
     * Navigate to a new page (push onto stack).
     *
     * @param url Page URL with optional query string (e.g., "/pages/detail/detail?id=1&title=foo")
     */
    fun navigateTo(url: String) {
        val parsed = UrlParser.parse(url)
        navigateTo(parsed.path, parsed.query)
    }

    /**
     * Navigate to a new page (push onto stack).
     *
     * @param pageId Page path without query string
     * @param query Query parameters
     */
    fun navigateTo(pageId: String, query: Map<String, String> = emptyMap()) {
        _currentPage?.hide()

        // Trim bottom of stack if we'd exceed the limit
        trimStackForNewPage()

        val page = PageRuntime(pageId, platform)
        page.load(query)
        pageStack.add(page)
        _currentPage = page
    }

    /**
     * Replace the current page (same stack depth).
     *
     * @param url Page URL with optional query string
     */
    fun redirectTo(url: String) {
        val parsed = UrlParser.parse(url)
        redirectTo(parsed.path, parsed.query)
    }

    /**
     * Replace the current page (same stack depth).
     */
    fun redirectTo(pageId: String, query: Map<String, String> = emptyMap()) {
        _currentPage?.unload()
        if (pageStack.isNotEmpty()) {
            pageStack.removeAt(pageStack.lastIndex)
        }

        val page = PageRuntime(pageId, platform)
        page.load(query)
        pageStack.add(page)
        _currentPage = page
    }

    /**
     * Navigate back by delta pages.
     */
    fun navigateBack(delta: Int = 1) {
        val steps = minOf(delta, pageStack.size - 1)
        if (steps <= 0) return

        repeat(steps) {
            val page = pageStack.removeAt(pageStack.lastIndex)
            page.unload()
        }
        _currentPage = pageStack.lastOrNull()
        _currentPage?.show()
    }

    /**
     * Clear the stack and navigate to a new page.
     *
     * @param url Page URL with optional query string
     */
    fun reLaunch(url: String) {
        val parsed = UrlParser.parse(url)
        reLaunch(parsed.path, parsed.query)
    }

    /**
     * Clear the stack and navigate to a new page.
     */
    fun reLaunch(pageId: String, query: Map<String, String> = emptyMap()) {
        pageStack.forEach { it.unload() }
        pageStack.clear()

        val page = PageRuntime(pageId, platform)
        page.load(query)
        pageStack.add(page)
        _currentPage = page
    }

    /**
     * Switch to a tab page. If it exists in the stack, reuse it.
     */
    fun switchTab(pageId: String) {
        pageStack.forEach { it.hide() }

        val existing = pageStack.find { it.pageId == pageId }
        if (existing != null) {
            existing.show()
            _currentPage = existing
        } else {
            navigateTo(pageId)
        }
    }

    /**
     * Send data to the current page (setData)
     */
    fun setData(data: Map<String, Any>) {
        _currentPage?.setData(data)
    }

    /**
     * Get the current page's query parameters
     */
    fun getCurrentQuery(): Map<String, String> {
        return _currentPage?.getQuery() ?: emptyMap()
    }

    /**
     * Destroy all pages and clear the stack.
     */
    fun clear() {
        pageStack.forEach { it.unload() }
        pageStack.clear()
        _currentPage = null
    }

    /**
     * Trim the stack when adding a new page.
     */
    private fun trimStackForNewPage() {
        val excess = (pageStack.size + 1) - maxStackSize
        if (excess > 0) {
            val pagesToRemove = minOf(excess, pageStack.size - 1)
            repeat(pagesToRemove) {
                val bottomPage = pageStack.removeAt(0)
                bottomPage.unload()
            }
        }
    }

    companion object {
        const val DEFAULT_MAX_STACK_SIZE = 5
    }
}

/**
 * URL parser for mini-program page URLs
 *
 * Format: /pages/path/path?key1=value1&key2=value2
 */
object UrlParser {
    /**
     * Parse a URL into path and query parameters
     */
    fun parse(url: String): ParsedUrl {
        val questionMarkIndex = url.indexOf('?')
        if (questionMarkIndex == -1) {
            return ParsedUrl(
                path = normalizePath(url),
                query = emptyMap()
            )
        }

        val path = normalizePath(url.substring(0, questionMarkIndex))
        val queryString = url.substring(questionMarkIndex + 1)
        val query = parseQueryString(queryString)

        return ParsedUrl(path = path, query = query)
    }

    /**
     * Parse query string into key-value pairs
     */
    private fun parseQueryString(queryString: String): Map<String, String> {
        if (queryString.isEmpty()) return emptyMap()

        return queryString.split("&")
            .filter { it.isNotEmpty() }
            .associate { pair ->
                val eqIndex = pair.indexOf('=')
                if (eqIndex == -1) {
                    decodeComponent(pair) to ""
                } else {
                    decodeComponent(pair.substring(0, eqIndex)) to
                        decodeComponent(pair.substring(eqIndex + 1))
                }
            }
    }

    /**
     * Normalize path: remove leading/trailing slashes, ensure consistent format
     */
    private fun normalizePath(path: String): String {
        var normalized = path.trim()
        // Remove leading slash
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1)
        }
        // Remove trailing slash
        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length - 1)
        }
        return normalized
    }

    /**
     * URL decode a component
     */
    private fun decodeComponent(encoded: String): String {
        return try {
            // Simple URL decode for common cases
            encoded
                .replace("%20", " ")
                .replace("%26", "&")
                .replace("%3D", "=")
                .replace("%3F", "?")
                .replace("%2F", "/")
                .replace("+", " ")
        } catch (e: Exception) {
            encoded
        }
    }

    data class ParsedUrl(
        val path: String,
        val query: Map<String, String>
    )
}
