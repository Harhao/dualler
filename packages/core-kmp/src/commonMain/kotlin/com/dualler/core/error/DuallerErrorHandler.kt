package com.dualler.core.error

/**
 * Error information container
 */
data class ErrorInfo(
    val message: String,
    val stack: String? = null,
    val pageId: String? = null,
    val timestamp: Long = 0
)

/**
 * Promise rejection information container
 */
data class RejectionInfo(
    val reason: String,
    val pageId: String? = null,
    val timestamp: Long = 0
)

/**
 * Central error handler for Dualler engine
 * Dispatches JS runtime errors and unhandled promise rejections to registered callbacks
 */
class DuallerErrorHandler {
    private val errorCallbacks = mutableListOf<(ErrorInfo) -> Unit>()
    private val rejectionCallbacks = mutableListOf<(RejectionInfo) -> Unit>()

    /**
     * Notify all registered error callbacks
     */
    fun onError(info: ErrorInfo) {
        errorCallbacks.forEach { it(info) }
    }

    /**
     * Notify all registered rejection callbacks
     */
    fun onRejection(info: RejectionInfo) {
        rejectionCallbacks.forEach { it(info) }
    }

    /**
     * Register a callback for JS runtime errors
     */
    fun registerErrorCallback(callback: (ErrorInfo) -> Unit) {
        errorCallbacks.add(callback)
    }

    /**
     * Register a callback for unhandled promise rejections
     */
    fun registerRejectionCallback(callback: (RejectionInfo) -> Unit) {
        rejectionCallbacks.add(callback)
    }

    /**
     * Clear all registered callbacks
     */
    fun clear() {
        errorCallbacks.clear()
        rejectionCallbacks.clear()
    }
}
