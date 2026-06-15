package com.dualler.android.devtools

import com.dualler.core.devtools.DevToolsManager
import com.dualler.core.devtools.LogLevel

/**
 * Console bridge for intercepting JS console calls
 *
 * Intercepts console.log/warn/error from QuickJS and forwards to DevTools.
 */
class ConsoleBridge(private val devTools: DevToolsManager) {

    /**
     * Install console bridge into JS engine
     * Returns JS code to inject
     */
    fun getInstallScript(): String {
        return """
            var __dualler_console__ = {
                log: function() {
                    var args = Array.prototype.slice.call(arguments);
                    __dualler_devtools_log('INFO', 'console', args.map(String).join(' '));
                },
                warn: function() {
                    var args = Array.prototype.slice.call(arguments);
                    __dualler_devtools_log('WARN', 'console', args.map(String).join(' '));
                },
                error: function() {
                    var args = Array.prototype.slice.call(arguments);
                    __dualler_devtools_log('ERROR', 'console', args.map(String).join(' '));
                },
                debug: function() {
                    var args = Array.prototype.slice.call(arguments);
                    __dualler_devtools_log('DEBUG', 'console', args.map(String).join(' '));
                },
                info: function() {
                    var args = Array.prototype.slice.call(arguments);
                    __dualler_devtools_log('INFO', 'console', args.map(String).join(' '));
                }
            };

            // Override global console
            console = __dualler_console__;
        """.trimIndent()
    }

    /**
     * Handle log from JS engine
     */
    fun onLog(level: String, tag: String, message: String) {
        val logLevel = when (level) {
            "DEBUG" -> LogLevel.DEBUG
            "INFO" -> LogLevel.INFO
            "WARN" -> LogLevel.WARN
            "ERROR" -> LogLevel.ERROR
            else -> LogLevel.INFO
        }
        devTools.log(logLevel, tag, message)
    }
}
