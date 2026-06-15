package com.dualler.android.devtools

import com.dualler.core.devtools.DevToolsManager
import com.dualler.core.devtools.NetworkRecord
import java.util.UUID

/**
 * Network inspector for monitoring HTTP requests
 *
 * Wraps network calls to record request/response details.
 */
class NetworkInspector(private val devTools: DevToolsManager) {

    private val pendingRequests = mutableMapOf<String, RequestInfo>()

    data class RequestInfo(
        val url: String,
        val method: String,
        val headers: Map<String, String>,
        val body: String?,
        val startTime: Long
    )

    /**
     * Record request start
     */
    fun onRequestStart(url: String, method: String, headers: Map<String, String> = emptyMap(), body: String? = null): String {
        val id = UUID.randomUUID().toString()
        pendingRequests[id] = RequestInfo(url, method, headers, body, System.currentTimeMillis())
        return id
    }

    /**
     * Record request end
     */
    fun onRequestEnd(
        id: String,
        statusCode: Int,
        responseHeaders: Map<String, String> = emptyMap(),
        responseBody: String? = null
    ) {
        val info = pendingRequests.remove(id) ?: return
        val endTime = System.currentTimeMillis()

        val record = NetworkRecord(
            id = id,
            url = info.url,
            method = info.method,
            statusCode = statusCode,
            requestHeaders = info.headers,
            responseHeaders = responseHeaders,
            requestBody = info.body,
            responseBody = responseBody,
            startTime = info.startTime,
            endTime = endTime,
            duration = endTime - info.startTime
        )

        devTools.recordRequest(record)
    }

    /**
     * Record request error
     */
    fun onRequestError(id: String, error: String) {
        val info = pendingRequests.remove(id) ?: return
        val endTime = System.currentTimeMillis()

        val record = NetworkRecord(
            id = id,
            url = info.url,
            method = info.method,
            statusCode = -1,
            requestHeaders = info.headers,
            responseHeaders = emptyMap(),
            requestBody = info.body,
            responseBody = "Error: $error",
            startTime = info.startTime,
            endTime = endTime,
            duration = endTime - info.startTime
        )

        devTools.recordRequest(record)
    }

    /**
     * Get pending request count
     */
    fun getPendingCount(): Int = pendingRequests.size

    /**
     * Clear pending requests
     */
    fun clear() {
        pendingRequests.clear()
    }
}
