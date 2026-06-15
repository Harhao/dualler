package com.dualler.android.worker

import com.dualler.core.worker.DuallerWorker
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Android Worker implementation
 *
 * Runs in a separate thread with its own JS engine.
 * Communicates with main thread via message queue.
 */
class AndroidWorker(
    private val workerId: String,
    private val scriptPath: String
) : DuallerWorker {
    private val messageQueue = LinkedBlockingQueue<Any>()
    private val isRunning = AtomicBoolean(true)
    private var messageHandler: ((Any) -> Unit)? = null
    private val workerThread: Thread

    init {
        workerThread = Thread({
            runWorker()
        }, "dualler-worker-$workerId").apply {
            isDaemon = true
            start()
        }
    }

    override fun postMessage(data: Any) {
        if (isRunning.get()) {
            messageQueue.put(data)
        }
    }

    override fun onMessage(handler: (Any) -> Unit) {
        messageHandler = handler
    }

    override fun terminate() {
        isRunning.set(false)
        workerThread.interrupt()
    }

    /**
     * Worker main loop
     */
    private fun runWorker() {
        // Initialize worker JS engine
        // In production, this would create a new QuickJS instance
        val workerJs = """
            var onMessage = null;
            var __worker_callbacks__ = {};

            function postMessage(data) {
                __worker_postMessage(JSON.stringify(data));
            }

            function importScripts(url) {
                __worker_importScripts(url);
            }
        """.trimIndent()

        // Process messages
        while (isRunning.get()) {
            try {
                val message = messageQueue.take()
                processMessage(message)
            } catch (e: InterruptedException) {
                break
            }
        }
    }

    /**
     * Process a message from main thread
     */
    private fun processMessage(message: Any) {
        // In production, this would execute the message handler in JS
        // For now, just forward to the message handler
        messageHandler?.invoke(message)
    }

    /**
     * Send message back to main thread
     */
    fun sendToMain(data: Any) {
        messageHandler?.invoke(data)
    }
}
