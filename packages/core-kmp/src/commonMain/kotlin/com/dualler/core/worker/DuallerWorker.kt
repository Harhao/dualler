package com.dualler.core.worker

/**
 * Worker instance interface
 *
 * An independent JS runtime that communicates with main thread via postMessage/onMessage.
 * Restrictions:
 *   - Cannot call wx.* APIs
 *   - Cannot access DOM
 *   - Can use importScripts() for local scripts
 */
interface DuallerWorker {
    /**
     * Send message to Worker
     */
    fun postMessage(data: Any)

    /**
     * Register message handler (main thread side)
     */
    fun onMessage(handler: (Any) -> Unit)

    /**
     * Terminate Worker and release resources
     */
    fun terminate()
}
