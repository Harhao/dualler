package com.dualler.core.worker

/**
 * Worker thread manager interface
 *
 * Each Worker is an independent JS engine instance for CPU-intensive computation.
 * Workers cannot call wx.* APIs or access DOM.
 */
interface WorkerManager {
    /**
     * Create a Worker
     * @param workerId Worker identifier
     * @param scriptPath Script path relative to mini-program package
     * @return Worker instance
     */
    fun createWorker(workerId: String, scriptPath: String): DuallerWorker

    /**
     * Get an existing Worker
     */
    fun getWorker(workerId: String): DuallerWorker?

    /**
     * Terminate a Worker
     */
    fun terminateWorker(workerId: String)

    /**
     * Terminate all Workers
     */
    fun terminateAll()
}
