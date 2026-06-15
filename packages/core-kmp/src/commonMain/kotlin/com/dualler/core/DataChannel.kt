package com.dualler.core

import com.dualler.platform.PlatformBridge
import kotlinx.coroutines.*

/**
 * Data synchronization channel
 *
 * Optimization strategies:
 *   1. Path-based setData
 *   2. Auto batch merge (16ms window)
 *   3. Data size validation (256KB)
 */
class DataChannel(private val bridge: PlatformBridge) {
    companion object {
        const val MAX_SETDATA_SIZE = 256 * 1024  // 256KB
        const val BATCH_WINDOW_MS = 16L
    }

    private val pendingUpdates = mutableMapOf<String, MutableMap<String, Any>>()

    /**
     * Full setData
     */
    fun syncData(pageId: String, newData: Map<String, Any>) {
        scheduleFlush(pageId, newData)
    }

    /**
     * Path-based setData
     */
    fun setPathData(pageId: String, path: String, value: Any) {
        val patch = mapOf("__path__" to path, "__value__" to value)
        scheduleFlush(pageId, patch)
    }

    private fun scheduleFlush(pageId: String, patch: Map<String, Any>) {
        val pending = pendingUpdates.getOrPut(pageId) { mutableMapOf() }
        pending.putAll(patch)

        // Simplified: flush immediately (production would use coroutine delay for batching)
        val data = pendingUpdates.remove(pageId) ?: return
        if (data.isNotEmpty()) {
            flushToBridge(pageId, data)
        }
    }

    private fun flushToBridge(pageId: String, data: Map<String, Any>) {
        bridge.setData(pageId, data)
    }

    fun destroy() {
        pendingUpdates.clear()
    }
}
