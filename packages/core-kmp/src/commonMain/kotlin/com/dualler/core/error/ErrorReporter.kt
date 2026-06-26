package com.dualler.core.error

import com.dualler.platform.JSEngine

/**
 * Error reporter for capturing and reporting errors from the JS runtime.
 *
 * Injects global error handlers into the JS engine to catch:
 *   - Uncaught exceptions
 *   - Unhandled promise rejections
 *   - Console errors
 */
class ErrorReporter(private val jsEngine: JSEngine) {

    /** Registered error listeners */
    private val listeners = mutableListOf<(ErrorInfo) -> Unit>()

    /**
     * Inject global error handlers into the JS engine.
     *
     * Should be called after the JS engine is initialized but before
     * mini-program code is executed.
     */
    fun install() {
        val script = """
            // Global error handler
            globalThis.onerror = function(message, source, lineno, colno, error) {
                var errorInfo = {
                    type: 'error',
                    message: message || 'Unknown error',
                    source: source || '',
                    lineno: lineno || 0,
                    colno: colno || 0,
                    stack: error && error.stack ? error.stack : '',
                    timestamp: Date.now()
                };
                if (typeof __duallerReportError__ === 'function') {
                    __duallerReportError__(JSON.stringify(errorInfo));
                }
                return true; // Prevent default handling
            };

            // Unhandled promise rejection handler
            globalThis.addEventListener('unhandledrejection', function(event) {
                var reason = event.reason;
                var errorInfo = {
                    type: 'unhandledRejection',
                    message: reason && reason.message ? reason.message : String(reason),
                    stack: reason && reason.stack ? reason.stack : '',
                    timestamp: Date.now()
                };
                if (typeof __duallerReportError__ === 'function') {
                    __duallerReportError__(JSON.stringify(errorInfo));
                }
            });

            // Console error capture (optional, for debugging)
            var __origConsoleError__ = console.error;
            console.error = function() {
                var args = Array.prototype.slice.call(arguments);
                var message = args.map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                }).join(' ');

                if (typeof __duallerReportError__ === 'function') {
                    __duallerReportError__(JSON.stringify({
                        type: 'consoleError',
                        message: message,
                        timestamp: Date.now()
                    }));
                }

                // Call original console.error
                if (__origConsoleError__) {
                    __origConsoleError__.apply(console, arguments);
                }
            };
        """.trimIndent()

        // Register the error reporting callback
        jsEngine.registerCallback("__duallerReportError__") { args ->
            if (args.size > 0) {
                val errorJson = args.getString(0)
                handleReportedError(errorJson)
            }
            com.dualler.platform.model.JSValue.Null
        }

        // Inject the error handlers
        jsEngine.evaluateScript(script, "dualler://error-reporter")
    }

    /**
     * Handle an error reported from the JS runtime.
     */
    private fun handleReportedError(errorJson: String) {
        try {
            val message = extractJsonString(errorJson, "message") ?: "Unknown error"
            val stack = extractJsonString(errorJson, "stack") ?: ""
            val timestamp = extractJsonLong(errorJson, "timestamp") ?: System.currentTimeMillis()

            val error = ErrorInfo(
                message = message,
                stack = stack,
                timestamp = timestamp
            )
            for (listener in listeners) {
                listener(error)
            }
        } catch (e: Exception) {
            // Ignore parse errors
        }
    }

    /**
     * Add an error listener.
     */
    fun addListener(listener: (ErrorInfo) -> Unit) {
        listeners.add(listener)
    }

    /**
     * Remove an error listener.
     */
    fun removeListener(listener: (ErrorInfo) -> Unit) {
        listeners.remove(listener)
    }

    // JSON parsing helpers
    private fun extractJsonString(json: String, key: String): String? {
        val regex = """"$key"\s*:\s*"([^"]*?)""""
        return regex.toRegex().find(json)?.groupValues?.get(1)
    }

    private fun extractJsonLong(json: String, key: String): Long? {
        val regex = """"$key"\s*:\s*(\d+)"""
        return regex.toRegex().find(json)?.groupValues?.get(1)?.toLongOrNull()
    }
}
