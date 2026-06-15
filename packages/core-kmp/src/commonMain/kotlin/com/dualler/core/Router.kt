package com.dualler.core

import com.dualler.platform.Platform

/**
 * Page router manager
 *
 * Page stack rules:
 *   - navigateTo: push, keep current page
 *   - redirectTo: replace top of stack
 *   - navigateBack: pop top of stack
 *   - reLaunch: clear stack
 *   - switchTab: switch tab (don't destroy)
 */
class Router(private val platform: Platform) {
    private val pageStack = mutableListOf<PageRuntime>()
    private var _currentPage: PageRuntime? = null

    val currentPage: PageRuntime? get() = _currentPage
    val currentPath: String get() = _currentPage?.pageId ?: ""
    val stackSize: Int get() = pageStack.size

    fun navigateTo(pageId: String, query: Map<String, String> = emptyMap()) {
        _currentPage?.hide()
        val page = PageRuntime(pageId, platform)
        page.load(query)
        pageStack.add(page)
        _currentPage = page
    }

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

    fun navigateBack(delta: Int = 1) {
        val steps = minOf(delta, pageStack.size - 1)
        repeat(steps) {
            val page = pageStack.removeAt(pageStack.lastIndex)
            page.unload()
        }
        _currentPage = pageStack.lastOrNull()
        _currentPage?.show()
    }

    fun reLaunch(pageId: String, query: Map<String, String> = emptyMap()) {
        pageStack.forEach { it.unload() }
        pageStack.clear()
        val page = PageRuntime(pageId, platform)
        page.load(query)
        pageStack.add(page)
        _currentPage = page
    }

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

    fun clear() {
        pageStack.forEach { it.unload() }
        pageStack.clear()
        _currentPage = null
    }
}
