package com.dualler.core

import com.dualler.platform.PlatformBridge
import kotlinx.coroutines.*

/**
 * Data synchronization channel between logic layer and render layer.
 *
 * Optimization strategies:
 *   1. Path-based setData — only send changed paths, not full data
 *   2. Auto batch merge — merge multiple setData calls within 16ms window
 *   3. Data size validation — reject data exceeding 256KB, split if needed
 *   4. Chunked delivery — large data is split into chunks to avoid blocking
 */
class DataChannel(
    private val bridge: PlatformBridge,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    companion object {
        /** Maximum single setData payload size (256KB) */
        const val MAX_SETDATA_SIZE = 256 * 1024

        /** Batch merge window in milliseconds (16ms ≈ 1 frame at 60fps) */
        const val BATCH_WINDOW_MS = 16L

        /** Chunk size for large data delivery (64KB) */
        const val CHUNK_SIZE = 64 * 1024
    }

    /** Pending updates per page, merged during the batch window */
    private val pendingUpdates = mutableMapOf<String, MutableMap<String, Any>>()

    /** Active batch jobs per page */
    private val batchJobs = mutableMapOf<String, Job>()

    /** Flag to track if channel is destroyed */
    private var destroyed = false

    /**
     * Full setData — send a complete data object to the render layer.
     *
     * Multiple calls within the batch window are automatically merged.
     * Data exceeding 256KB is split into chunks.
     */
    fun syncData(pageId: String, newData: Map<String, Any>) {
        if (destroyed) return
        scheduleFlush(pageId, newData)
    }

    /**
     * Path-based setData — update a specific path in the render layer's data.
     *
     * Example: setPathData("pages/index", "list[0].name", "new value")
     * This is more efficient than sending the full data object.
     */
    fun setPathData(pageId: String, path: String, value: Any) {
        if (destroyed) return
        val patch = mapOf("__path__" to path, "__value__" to value)
        scheduleFlush(pageId, patch)
    }

    /**
     * Schedule a flush with batch merging.
     *
     * Multiple setData calls within BATCH_WINDOW_MS are merged into a single
     * bridge call to reduce IPC overhead.
     */
    private fun scheduleFlush(pageId: String, patch: Map<String, Any>) {
        val pending = pendingUpdates.getOrPut(pageId) { mutableMapOf() }
        pending.putAll(patch)

        // Cancel existing batch job for this page
        batchJobs[pageId]?.cancel()

        // Schedule a new batch flush after the window
        batchJobs[pageId] = scope.launch {
            delay(BATCH_WINDOW_MS)
            val data = pendingUpdates.remove(pageId) ?: return@launch
            batchJobs.remove(pageId)

            if (data.isNotEmpty()) {
                validateAndFlush(pageId, data)
            }
        }
    }

    /**
     * Validate data size and flush to bridge.
     *
     * If data exceeds MAX_SETDATA_SIZE, split into chunks.
     */
    private fun validateAndFlush(pageId: String, data: Map<String, Any>) {
        val jsonSize = estimateJsonSize(data)

        if (jsonSize <= MAX_SETDATA_SIZE) {
            // Data is within limit, send directly
            flushToBridge(pageId, data)
        } else {
            // Data exceeds limit, split into chunks
            val chunks = splitData(data, MAX_SETDATA_SIZE)
            for (chunk in chunks) {
                flushToBridge(pageId, chunk)
            }
        }
    }

    /**
     * Flush data to the platform bridge.
     */
    private fun flushToBridge(pageId: String, data: Map<String, Any>) {
        try {
            bridge.setData(pageId, data)
        } catch (e: Exception) {
            // Bridge may not be ready yet
        }
    }

    /**
     * Estimate JSON serialization size without actually serializing.
     * This is a rough estimate for performance.
     */
    private fun estimateJsonSize(data: Map<String, Any>): Int {
        var size = 2 // { }
        for ((key, value) in data) {
            size += key.length + 4 // "key":
            size += estimateValueSize(value)
            size += 1 // ,
        }
        return size
    }

    private fun estimateValueSize(value: Any?): Int {
        return when (value) {
            null -> 4 // "null"
            is String -> value.length + 2 // "value"
            is Number -> value.toString().length
            is Boolean -> if (value) 4 else 5 // true/false
            is Map<*, *> -> {
                @Suppress("UNCHECKED_CAST")
                estimateJsonSize(value as Map<String, Any>)
            }
            is Collection<*> -> {
                var size = 2 // [ ]
                for (item in value) {
                    size += estimateValueSize(item)
                    size += 1 // ,
                }
                size
            }
            else -> value.toString().length + 2
        }
    }

    /**
     * Split large data into chunks that fit within the size limit.
     *
     * Strategy: split top-level keys into groups that fit within chunkSize.
     */
    private fun splitData(data: Map<String, Any>, chunkSize: Int): List<Map<String, Any>> {
        val chunks = mutableListOf<Map<String, Any>>()
        var currentChunk = mutableMapOf<String, Any>()
        var currentSize = 2 // { }

        for ((key, value) in data) {
            val entrySize = key.length + 4 + estimateValueSize(value) + 1

            if (currentSize + entrySize > chunkSize && currentChunk.isNotEmpty()) {
                // Current chunk is full, start a new one
                chunks.add(currentChunk)
                currentChunk = mutableMapOf()
                currentSize = 2
            }

            currentChunk[key] = value
            currentSize += entrySize
        }

        if (currentChunk.isNotEmpty()) {
            chunks.add(currentChunk)
        }

        return chunks
    }

    /**
     * Check if there are pending updates for a page.
     */
    fun hasPendingUpdates(pageId: String): Boolean {
        return pendingUpdates.containsKey(pageId)
    }

    /**
     * Force flush all pending updates immediately.
     */
    fun flushAll() {
        for ((pageId, data) in pendingUpdates.toMap()) {
            if (data.isNotEmpty()) {
                pendingUpdates.remove(pageId)
                validateAndFlush(pageId, data)
            }
        }
        batchJobs.values.forEach { it.cancel() }
        batchJobs.clear()
    }

    /**
     * Destroy the data channel and cancel all pending operations.
     */
    fun destroy() {
        destroyed = true
        batchJobs.values.forEach { it.cancel() }
        batchJobs.clear()
        pendingUpdates.clear()
        scope.cancel()
    }
}
