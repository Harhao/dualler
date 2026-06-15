package com.dualler.core.component

/**
 * Virtual list configuration
 */
data class VirtualListConfig(
    val list: List<Any>,           // List data
    val itemHeight: Int,           // Fixed item height (px)
    val bufferSize: Int = 5,       // Buffer items outside viewport
    val containerHeight: Int = 0   // Container height (0 = screen height)
)

/**
 * Virtual list manager interface
 *
 * When DOM nodes exceed 1000, virtual list must be used.
 * Only renders visible items + buffer, recycles off-screen DOM nodes.
 */
interface VirtualListManager {
    /**
     * Initialize virtual list
     * @param containerId Container element ID
     * @param config Virtual list configuration
     */
    fun init(containerId: String, config: VirtualListConfig)

    /**
     * Update list data
     */
    fun updateData(list: List<Any>)

    /**
     * Scroll to specific index
     */
    fun scrollToIndex(index: Int)

    /**
     * Get current visible range
     */
    fun getVisibleRange(): Pair<Int, Int>

    /**
     * Destroy virtual list
     */
    fun destroy()
}
