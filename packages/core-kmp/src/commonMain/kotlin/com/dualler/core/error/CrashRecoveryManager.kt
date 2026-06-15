package com.dualler.core.error

import com.dualler.platform.Platform

/**
 * Crash recovery information
 */
data class CrashRecoveryInfo(
    val lastPage: String,
    val savedState: Map<String, Any>,
    val crashedAt: Long,
    val recoveredAt: Long
)

/**
 * Get current time in milliseconds (multiplatform compatible)
 */
expect fun currentTimeMillis(): Long

/**
 * Manages crash detection and recovery state persistence
 * Saves the current app state to platform storage so that on next launch
 * the engine can detect if the previous session crashed and recover
 */
class CrashRecoveryManager(private val platform: Platform) {
    companion object {
        private const val KEY_LAST_PAGE = "__dualler_last_page__"
        private const val KEY_LAST_TIMESTAMP = "__dualler_last_timestamp__"
        private const val CRASH_TIMEOUT_MS = 30_000L
    }

    private val storage = platform.storage

    /**
     * Save current app state for crash recovery
     */
    fun saveAppState(appId: String, currentPage: String, data: Map<String, Any>) {
        storage.setItem("${appId}_$KEY_LAST_PAGE", currentPage)
        storage.setItem("${appId}_$KEY_LAST_TIMESTAMP", currentTimeMillis().toString())
    }

    /**
     * Detect if the previous session crashed and should be recovered
     * Returns null if no crash detected (clean exit or timeout exceeded)
     */
    fun detectCrashRecovery(appId: String): CrashRecoveryInfo? {
        val lastTimestamp = storage.getItem("${appId}_$KEY_LAST_TIMESTAMP")?.toLongOrNull()
            ?: return null
        val elapsed = currentTimeMillis() - lastTimestamp
        if (elapsed > CRASH_TIMEOUT_MS) return null
        val lastPage = storage.getItem("${appId}_$KEY_LAST_PAGE") ?: return null
        return CrashRecoveryInfo(
            lastPage = lastPage,
            savedState = emptyMap(),
            crashedAt = lastTimestamp,
            recoveredAt = currentTimeMillis()
        )
    }

    /**
     * Clear recovery data after successful recovery or clean exit
     */
    fun clearRecoveryData(appId: String) {
        storage.removeItem("${appId}_$KEY_LAST_PAGE")
        storage.removeItem("${appId}_$KEY_LAST_TIMESTAMP")
    }
}
