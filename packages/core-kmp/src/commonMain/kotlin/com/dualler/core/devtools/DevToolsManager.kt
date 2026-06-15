package com.dualler.core.devtools

/**
 * DevTools manager interface
 *
 * Provides debugging capabilities:
 *   - Console: log/warn/error output
 *   - Network: request/response monitoring
 *   - Components: component tree inspection
 *   - Storage: key-value storage viewer
 *   - Performance: metrics monitoring
 */
interface DevToolsManager {
    /** Start DevTools server */
    fun start(port: Int = 9222)

    /** Stop DevTools server */
    fun stop()

    /** Check if DevTools is running */
    fun isRunning(): Boolean

    /** Log a message */
    fun log(level: LogLevel, tag: String, message: String)

    /** Record a network request */
    fun recordRequest(request: NetworkRecord)

    /** Record a performance metric */
    fun recordMetric(metric: PerformanceMetric)
}

enum class LogLevel { DEBUG, INFO, WARN, ERROR }

data class NetworkRecord(
    val id: String,
    val url: String,
    val method: String,
    val statusCode: Int?,
    val requestHeaders: Map<String, String>,
    val responseHeaders: Map<String, String>,
    val requestBody: String?,
    val responseBody: String?,
    val startTime: Long,
    val endTime: Long?,
    val duration: Long?
)

data class PerformanceMetric(
    val name: String,
    val value: Long,
    val unit: String,
    val timestamp: Long
)
