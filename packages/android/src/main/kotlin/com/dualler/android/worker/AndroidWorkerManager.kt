package com.dualler.android.worker

import com.dualler.core.worker.DuallerWorker
import com.dualler.core.worker.WorkerManager

/**
 * Android Worker Manager implementation
 *
 * Each Worker runs in a separate thread with its own JS engine instance.
 */
class AndroidWorkerManager : WorkerManager {
    private val workers = mutableMapOf<String, AndroidWorker>()

    override fun createWorker(workerId: String, scriptPath: String): DuallerWorker {
        val worker = AndroidWorker(workerId, scriptPath)
        workers[workerId] = worker
        return worker
    }

    override fun getWorker(workerId: String): DuallerWorker? {
        return workers[workerId]
    }

    override fun terminateWorker(workerId: String) {
        workers.remove(workerId)?.terminate()
    }

    override fun terminateAll() {
        workers.values.forEach { it.terminate() }
        workers.clear()
    }
}
