package com.dualler.android.devtools

import com.dualler.core.devtools.DevToolsManager
import com.dualler.core.devtools.PerformanceMetric

/**
 * Performance monitor for tracking key metrics
 *
 * Tracks:
 *   - First paint time
 *   - Page load time
 *   - setData duration
 *   - Event handler duration
 *   - Memory usage
 */
class PerformanceMonitor(private val devTools: DevToolsManager) {

    private val timers = mutableMapOf<String, Long>()

    /**
     * Start a timer
     */
    fun startTimer(name: String) {
        timers[name] = System.currentTimeMillis()
    }

    /**
     * End a timer and record metric
     */
    fun endTimer(name: String): Long {
        val startTime = timers.remove(name) ?: return -1
        val duration = System.currentTimeMillis() - startTime

        devTools.recordMetric(PerformanceMetric(
            name = name,
            value = duration,
            unit = "ms",
            timestamp = System.currentTimeMillis()
        ))

        return duration
    }

    /**
     * Record first paint time
     */
    fun recordFirstPaint(pageId: String, duration: Long) {
        devTools.recordMetric(PerformanceMetric(
            name = "first_paint",
            value = duration,
            unit = "ms",
            timestamp = System.currentTimeMillis()
        ))
    }

    /**
     * Record page load time
     */
    fun recordPageLoad(pageId: String, duration: Long) {
        devTools.recordMetric(PerformanceMetric(
            name = "page_load",
            value = duration,
            unit = "ms",
            timestamp = System.currentTimeMillis()
        ))
    }

    /**
     * Record setData duration
     */
    fun recordSetData(duration: Long, dataSize: Int) {
        devTools.recordMetric(PerformanceMetric(
            name = "set_data",
            value = duration,
            unit = "ms",
            timestamp = System.currentTimeMillis()
        ))
    }

    /**
     * Record event handler duration
     */
    fun recordEventHandler(eventType: String, duration: Long) {
        devTools.recordMetric(PerformanceMetric(
            name = "event_$eventType",
            value = duration,
            unit = "ms",
            timestamp = System.currentTimeMillis()
        ))
    }

    /**
     * Get memory usage info
     */
    fun getMemoryInfo(): Map<String, Long> {
        val runtime = Runtime.getRuntime()
        return mapOf(
            "totalMemory" to runtime.totalMemory(),
            "freeMemory" to runtime.freeMemory(),
            "usedMemory" to (runtime.totalMemory() - runtime.freeMemory()),
            "maxMemory" to runtime.maxMemory()
        )
    }

    /**
     * Clear all timers
     */
    fun clear() {
        timers.clear()
    }
}
