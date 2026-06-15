package com.dualler.android.devtools

import com.dualler.core.devtools.DevToolsManager
import com.dualler.core.devtools.LogLevel
import com.dualler.core.devtools.NetworkRecord
import com.dualler.core.devtools.PerformanceMetric
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * DevTools WebSocket server
 *
 * Provides Chrome DevTools Protocol compatible interface.
 * Can be connected via chrome://inspect or custom DevTools UI.
 */
class DevToolsServer : DevToolsManager {
    private var serverSocket: ServerSocket? = null
    private var isServerRunning = false
    private val logs = ConcurrentLinkedQueue<LogEntry>()
    private val networkRecords = ConcurrentLinkedQueue<NetworkRecord>()
    private val metrics = ConcurrentLinkedQueue<PerformanceMetric>()
    private val clients = mutableListOf<PrintWriter>()

    data class LogEntry(
        val level: LogLevel,
        val tag: String,
        val message: String,
        val timestamp: Long = System.currentTimeMillis()
    )

    override fun start(port: Int) {
        if (isServerRunning) return

        Thread {
            try {
                serverSocket = ServerSocket(port)
                isServerRunning = true
                println("DevTools server started on port $port")

                while (isServerRunning) {
                    val client = serverSocket?.accept() ?: break
                    handleClient(client)
                }
            } catch (e: Exception) {
                if (isServerRunning) {
                    e.printStackTrace()
                }
            }
        }.apply {
            isDaemon = true
            name = "dualler-devtools"
        }.start()
    }

    override fun stop() {
        isServerRunning = false
        serverSocket?.close()
        serverSocket = null
        clients.forEach { it.close() }
        clients.clear()
    }

    override fun isRunning(): Boolean = isServerRunning

    override fun log(level: LogLevel, tag: String, message: String) {
        val entry = LogEntry(level, tag, message)
        logs.add(entry)
        broadcast("""{"type":"log","level":"${level.name}","tag":"$tag","message":"${message.replace("\"", "\\\"").replace("\n", "\\n")}"}""")
    }

    override fun recordRequest(request: NetworkRecord) {
        networkRecords.add(request)
        broadcast("""{"type":"network","id":"${request.id}","url":"${request.url}","method":"${request.method}","status":${request.statusCode ?: 0},"duration":${request.duration ?: 0}}""")
    }

    override fun recordMetric(metric: PerformanceMetric) {
        metrics.add(metric)
        broadcast("""{"type":"metric","name":"${metric.name}","value":${metric.value},"unit":"${metric.unit}"}""")
    }

    fun getLogs(): List<LogEntry> = logs.toList()
    fun getNetworkRecords(): List<NetworkRecord> = networkRecords.toList()
    fun getMetrics(): List<PerformanceMetric> = metrics.toList()

    fun clear() {
        logs.clear()
        networkRecords.clear()
        metrics.clear()
    }

    private fun handleClient(socket: Socket) {
        Thread {
            try {
                val reader = socket.getInputStream().bufferedReader()
                val writer = PrintWriter(socket.getOutputStream(), true)
                clients.add(writer)

                writer.println("""{"type":"init","logs":${logs.size},"network":${networkRecords.size},"metrics":${metrics.size}}""")

                while (isServerRunning && !socket.isClosed) {
                    val line = reader.readLine() ?: break
                    handleCommand(line, writer)
                }
            } catch (e: Exception) {
                // Client disconnected
            } finally {
                socket.close()
            }
        }.apply {
            isDaemon = true
        }.start()
    }

    private fun handleCommand(command: String, writer: PrintWriter) {
        when (command) {
            "getLogs" -> writer.println("""{"type":"logs","count":${logs.size}}""")
            "getNetwork" -> writer.println("""{"type":"network","count":${networkRecords.size}}""")
            "getMetrics" -> writer.println("""{"type":"metrics","count":${metrics.size}}""")
            "clear" -> {
                clear()
                writer.println("""{"type":"cleared"}""")
            }
        }
    }

    private fun broadcast(message: String) {
        clients.removeAll { writer ->
            try {
                writer.println(message)
                false
            } catch (e: Exception) {
                true
            }
        }
    }
}
